import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export function CriarEmLoteTab({ fazendaId }: { fazendaId: string }) {
    const qc = useQueryClient();
    const [loteId, setLoteId] = useState('');
    const [prefixo, setPrefixo] = useState('');
    const [animais, setAnimais] = useState<Array<{ id: string; numero: string; sexo: string; peso: string; paiId: string; nascimento: string }>>([
        { id: '1', numero: '', sexo: 'MACHO', peso: '', paiId: '', nascimento: '' }
    ]);

    const { data: lotes } = useQuery({
        queryKey: ['lotes', fazendaId],
        enabled: !!fazendaId,
        queryFn: () => apiFetch<{ items: any[] }>(`/lotes?fazendaId=${fazendaId}`)
    });

    const { data: pais } = useQuery({
        queryKey: ['pais', fazendaId],
        enabled: !!fazendaId,
        queryFn: () => apiFetch<any[]>(`/pais?fazendaId=${fazendaId}`)
    });

    const createAnimal = useMutation({
        mutationFn: (body: any) => apiFetch('/animais', { method: 'POST', body: JSON.stringify(body) }),
    });

    const criarPesagem = useMutation({
        mutationFn: (data: any) => apiFetch('/pesagens', { method: 'POST', body: JSON.stringify(data) }),
    });

    const adicionarLinha = () => {
        setAnimais(prev => [...prev, {
            id: Math.random().toString(),
            numero: '',
            sexo: 'MACHO',
            peso: '',
            paiId: '',
            nascimento: ''
        }]);
    };

    const removerLinha = (id: string) => {
        if (animais.length > 1) {
            setAnimais(prev => prev.filter(a => a.id !== id));
        }
    };

    const atualizarAnimal = (id: string, campo: string, valor: string) => {
        setAnimais(prev => prev.map(a =>
            a.id === id ? { ...a, [campo]: valor } : a
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prefixo) {
            alert('Preencha o prefixo');
            return;
        }

        try {
            for (const animal of animais) {
                if (animal.numero) {
                    const animalData = {
                        fazendaId,
                        prefixo,
                        numero: Number(animal.numero),
                        sexo: animal.sexo,
                        paiId: animal.paiId || undefined,
                        nascimento: animal.nascimento ? new Date(animal.nascimento).toISOString() : undefined,
                        loteId: loteId || undefined,
                        status: 'ATIVO'
                    };

                    const created = await createAnimal.mutateAsync(animalData) as any;

                    if (animal.peso && Number(animal.peso) > 0) {
                        await criarPesagem.mutateAsync({
                            animalId: created.id,
                            peso: Number(animal.peso),
                            flag: 'ATIVO',
                            observacao: 'Peso inicial'
                        });
                    }
                }
            }

            qc.invalidateQueries({ queryKey: ['animais'] });
            qc.invalidateQueries({ queryKey: ['lotes'] });
            alert('Animais criados com sucesso!');

            // Reset
            setAnimais([{ id: '1', numero: '', sexo: 'MACHO', peso: '', paiId: '', nascimento: '' }]);
            setPrefixo('');
            setLoteId('');
        } catch (error) {
            console.error('Erro ao criar animais:', error);
            alert('Erro ao criar animais. Verifique se os números já existem.');
        }
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Criação em Massa</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prefixo Geral *</label>
                        <input
                            value={prefixo}
                            onChange={e => setPrefixo(e.target.value.toUpperCase())}
                            required
                            maxLength={4}
                            placeholder="Ex: ERO"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lote de Destino</label>
                        <select
                            value={loteId}
                            onChange={e => setLoteId(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Nenhum</option>
                            {lotes?.items?.map((l: any) => <option key={l.id} value={l.id}>{l.nome}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    {animais.map((animal, index) => (
                        <div key={animal.id} className="flex flex-wrap gap-3 items-end p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="w-10 pt-6 font-bold text-gray-400 text-center">#{index + 1}</div>
                            <div className="w-32">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Número *</label>
                                <input
                                    type="number"
                                    value={animal.numero}
                                    onChange={e => atualizarAnimal(animal.id, 'numero', e.target.value)}
                                    placeholder="123"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="w-32">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Sexo</label>
                                <select
                                    value={animal.sexo}
                                    onChange={e => atualizarAnimal(animal.id, 'sexo', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="MACHO">Macho</option>
                                    <option value="FEMEA">Fêmea</option>
                                </select>
                            </div>
                            <div className="w-32">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Peso (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={animal.peso}
                                    onChange={e => atualizarAnimal(animal.id, 'peso', e.target.value)}
                                    placeholder="0.0"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="w-40">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Nascimento</label>
                                <input
                                    type="date"
                                    value={animal.nascimento}
                                    onChange={e => atualizarAnimal(animal.id, 'nascimento', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Pai</label>
                                <select
                                    value={animal.paiId}
                                    onChange={e => atualizarAnimal(animal.id, 'paiId', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Nenhum</option>
                                    {pais?.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={() => removerLinha(animal.id)}
                                className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition"
                                title="Remover linha"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={adicionarLinha}
                        className="flex-1 bg-white border-2 border-dashed border-green-300 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
                    >
                        + Adicionar Linha
                    </button>
                    <button
                        type="submit"
                        disabled={createAnimal.isPending}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition shadow-lg"
                    >
                        {createAnimal.isPending ? 'Salvando...' : 'Salvar Todos'}
                    </button>
                </div>
            </form>
        </div>
    );
}
