import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { NavBar } from '../components/NavBar';
import { useAuthStore } from '../stores/auth';

export function CriarLotePage() {
  const qc = useQueryClient();
  const fazendaId = useAuthStore(s => s.fazendaSelecionada);
  
  const [nome, setNome] = useState('');
  const [prefixo, setPrefixo] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [animaisSelecionados, setAnimaisSelecionados] = useState<string[]>([]);
  
  // Formulário de criação rápida de animais
  const [prefixoPadrao, setPrefixoPadrao] = useState('');
  const [novosAnimais, setNovosAnimais] = useState<Array<{id: string; numero: string; sexo: string; peso: string; paiId: string}>>([]);
  
  const { data: animais } = useQuery({
    queryKey: ['animais', fazendaId, { status: 'ATIVO' }],
    queryFn: () => apiFetch<{ items: any[] }>(`/animais?fazendaId=${fazendaId}&status=ATIVO&limit=1000`),
    enabled: !!fazendaId,
  });
  
  const { data: pais } = useQuery({ 
    queryKey: ['pais', fazendaId], 
    enabled: !!fazendaId, 
    queryFn: () => apiFetch<any[]>(`/pais?fazendaId=${fazendaId}`) 
  });

  const createLote = useMutation({
    mutationFn: (body: any) => apiFetch('/lotes', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['lotes', 'animais'] });
      // Resetar formulário ao invés de navegar
      setNome('');
      setPrefixo('');
      setCapacidade('');
      setAnimaisSelecionados([]);
      setPrefixoPadrao('');
      setNovosAnimais([]);
    }
  });
  
  const createAnimal = useMutation({
    mutationFn: (body: any) => apiFetch('/animais', { method: 'POST', body: JSON.stringify(body) }),
  });
  
  const criarPesagem = useMutation({
    mutationFn: (data: any) => apiFetch('/pesagens', { method: 'POST', body: JSON.stringify(data) }),
  });

  const toggleAnimal = (id: string) => {
    setAnimaisSelecionados(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };
  
  const adicionarNovoAnimal = () => {
    setNovosAnimais(prev => [...prev, {
      id: Math.random().toString(),
      numero: '',
      sexo: 'MACHO',
      peso: '',
      paiId: ''
    }]);
  };
  
  const removerNovoAnimal = (id: string) => {
    setNovosAnimais(prev => prev.filter(a => a.id !== id));
  };
  
  const atualizarNovoAnimal = (id: string, campo: string, valor: string) => {
    setNovosAnimais(prev => prev.map(a => 
      a.id === id ? { ...a, [campo]: valor } : a
    ));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Primeiro criar os novos animais
      const animaisCriadosIds: string[] = [];
      
      for (const novoAnimal of novosAnimais) {
        if (novoAnimal.numero) {
          const animalData = {
            fazendaId,
            prefixo: prefixoPadrao || prefixo,
            numero: Number(novoAnimal.numero),
            sexo: novoAnimal.sexo,
            paiId: novoAnimal.paiId || undefined,
            status: 'ATIVO'
          };
          
          const created = await createAnimal.mutateAsync(animalData) as any;
          animaisCriadosIds.push(created.id);
          
          // Se tem peso, criar pesagem inicial
          if (novoAnimal.peso && Number(novoAnimal.peso) > 0) {
            await criarPesagem.mutateAsync({
              animalId: created.id,
              peso: Number(novoAnimal.peso),
              flag: 'ATIVO',
              observacao: 'Peso inicial'
            });
          }
        }
      }
      
      // Criar o lote com animais selecionados + recém criados
      await createLote.mutateAsync({
        fazendaId,
        nome,
        prefixo: prefixo || undefined,
        capacidade: capacidade ? Number(capacidade) : undefined,
        animalIds: [...animaisSelecionados, ...animaisCriadosIds].length > 0 
          ? [...animaisSelecionados, ...animaisCriadosIds] 
          : undefined
      });
    } catch (error) {
      console.error('Erro ao criar lote:', error);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <NavBar />
      <h2 className="text-2xl font-bold mb-6">📦 Criar Lote</h2>
      
      <div className="bg-white shadow rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações do Lote */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Lote *</label>
              <input value={nome} onChange={e => setNome(e.target.value)} required placeholder="Ex: Lote A" className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prefixo do Lote</label>
              <input value={prefixo} onChange={e => setPrefixo(e.target.value.toUpperCase())} placeholder="Ex: LA" maxLength={4} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacidade</label>
              <input type="number" value={capacidade} onChange={e => setCapacidade(e.target.value)} placeholder="Ex: 50" className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>

          {/* Criação Rápida de Animais */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">🐄 Criar Novos Animais</h3>
                <p className="text-sm text-slate-600">Adicione animais rapidamente ao lote</p>
              </div>
              <button
                type="button"
                onClick={adicionarNovoAnimal}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
              >
                + Adicionar Animal
              </button>
            </div>
            
            {novosAnimais.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Prefixo Padrão para Novos Animais</label>
                <input 
                  value={prefixoPadrao} 
                  onChange={e => setPrefixoPadrao(e.target.value.toUpperCase())} 
                  placeholder="Ex: ERO" 
                  maxLength={4}
                  className="w-full max-w-xs border rounded-lg px-3 py-2"
                />
              </div>
            )}
            
            {novosAnimais.length > 0 && (
              <div className="space-y-3 mb-4">
                {novosAnimais.map((animal) => (
                  <div key={animal.id} className="flex gap-3 items-end p-4 bg-green-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Número *</label>
                        <input
                          type="number"
                          value={animal.numero}
                          onChange={e => atualizarNovoAnimal(animal.id, 'numero', e.target.value)}
                          placeholder="123"
                          required
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Sexo</label>
                        <select
                          value={animal.sexo}
                          onChange={e => atualizarNovoAnimal(animal.id, 'sexo', e.target.value)}
                          className="w-full border rounded-lg px-3 py-2"
                        >
                          <option value="MACHO">Macho</option>
                          <option value="FEMEA">Fêmea</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Peso Inicial (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={animal.peso}
                          onChange={e => atualizarNovoAnimal(animal.id, 'peso', e.target.value)}
                          placeholder="0.0"
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium mb-1">Pai</label>
                        <select
                          value={animal.paiId}
                          onChange={e => atualizarNovoAnimal(animal.id, 'paiId', e.target.value)}
                          className="w-full border rounded-lg px-3 py-2"
                        >
                          <option value="">Nenhum / Desconhecido</option>
                          {pais?.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removerNovoAnimal(animal.id)}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Animais Existentes */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">📋 Animais Livres ({animais?.items?.length || 0})</h3>
            <p className="text-sm text-slate-600 mb-4">Selecione animais existentes para adicionar ao lote ({animaisSelecionados.length} selecionados)</p>
            
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              {animais?.items?.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  Nenhum animal disponível
                </div>
              )}
              
              <div className="divide-y">
                {animais?.items?.map((animal: any) => (
                  <label
                    key={animal.id}
                    className="flex items-center p-3 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={animaisSelecionados.includes(animal.id)}
                      onChange={() => toggleAnimal(animal.id)}
                      className="mr-3 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{animal.brinco}</div>
                      <div className="text-sm text-slate-600">
                        {animal.sexo} • {animal.lote?.nome || 'Sem lote'}
                        {animal.pesagens?.[0] && ` • ${animal.pesagens[0].peso}kg`}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button 
              type="submit" 
              disabled={createLote.isPending || createAnimal.isPending} 
              className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {createLote.isPending || createAnimal.isPending ? 'Criando...' : 'Criar Lote'}
            </button>
          </div>
          
          {createLote.isSuccess && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-green-700 font-medium">✅ Lote criado com sucesso!</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

