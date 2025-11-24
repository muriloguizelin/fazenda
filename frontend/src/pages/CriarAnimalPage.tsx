import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { useAuthStore } from '../stores/auth';

export function CriarAnimalPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fazendaId = useAuthStore(s => s.fazendaSelecionada);
  const { data: lotes } = useQuery({ queryKey: ['lotes', fazendaId], enabled: !!fazendaId, queryFn: () => apiFetch<{ items: any[] }>(`/lotes?fazendaId=${fazendaId || ''}`) });
  const { data: prefixosData } = useQuery({ queryKey: ['prefixos', fazendaId], enabled: !!fazendaId, queryFn: () => apiFetch<{ prefixos: string[] }>(`/animais/prefixos?fazendaId=${fazendaId}`) });

  const createAnimal = useMutation({
    mutationFn: (body: any) => apiFetch('/animais', { method: 'POST', body: JSON.stringify(body) }),
  });

  const [prefixo, setPrefixo] = useState('');
  const [novoPrefixo, setNovoPrefixo] = useState('');
  const [usarNovoPrefixo, setUsarNovoPrefixo] = useState(false);
  const [numero, setNumero] = useState('');
  const [sexo, setSexo] = useState('MACHO');
  const [paiId, setPaiId] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [origem, setOrigem] = useState('');
  const [loteId, setLoteId] = useState('');
  const [pesoInicial, setPesoInicial] = useState('');

  const { data: pais } = useQuery({
    queryKey: ['pais', fazendaId],
    enabled: !!fazendaId,
    queryFn: () => apiFetch<any[]>(`/pais?fazendaId=${fazendaId}`)
  });

  const criarPesagemInicial = useMutation({
    mutationFn: (data: any) => apiFetch('/pesagens', { method: 'POST', body: JSON.stringify(data) }),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prefixoFinal = usarNovoPrefixo ? novoPrefixo : prefixo;
    const animalData = {
      fazendaId,
      prefixo: prefixoFinal,
      numero: Number(numero),
      sexo,
      paiId: paiId || undefined,
      nascimento: nascimento ? new Date(nascimento).toISOString() : undefined,
      origem: origem || undefined,
      loteId: loteId || undefined
    };
    const created = await createAnimal.mutateAsync(animalData) as any;
    if (pesoInicial && Number(pesoInicial) > 0) {
      await criarPesagemInicial.mutateAsync({ animalId: created.id, peso: Number(pesoInicial), flag: 'ATIVO', observacao: 'Peso inicial' });
    }
    qc.invalidateQueries({ queryKey: ['animais'] });
    qc.invalidateQueries({ queryKey: ['pesagens'] });
    navigate('/animais');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <NavBar />
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">Criar Animal</h2>
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prefixo</label>
              {!usarNovoPrefixo ? (
                <div className="space-y-2">
                  <select
                    value={prefixo}
                    onChange={e => setPrefixo(e.target.value)}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Selecione um prefixo</option>
                    {prefixosData?.prefixos?.map((p: string) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setUsarNovoPrefixo(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Criar novo prefixo
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    value={novoPrefixo}
                    onChange={e => setNovoPrefixo(e.target.value.toUpperCase())}
                    required
                    maxLength={4}
                    placeholder="Novo prefixo (3-4 letras)"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setUsarNovoPrefixo(false)}
                    className="text-sm text-gray-600 hover:underline"
                  >
                    ← Voltar para lista
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Número (1-10000)</label>
              <input type="number" min="1" max="10000" value={numero} onChange={e => setNumero(e.target.value)} required placeholder="123" className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sexo</label>
              <select value={sexo} onChange={e => setSexo(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option>MACHO</option>
                <option>FEMEA</option>
                <option>DESCONHECIDO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pai (Touro)</label>
              <select value={paiId} onChange={e => setPaiId(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option value="">Nenhum / Desconhecido</option>
                {pais?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
              <input type="date" value={nascimento} onChange={e => setNascimento(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Origem</label>
              <input value={origem} onChange={e => setOrigem(e.target.value)} placeholder="Compra, Nascido" className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Lote</label>
              <select value={loteId} onChange={e => setLoteId(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option value="">Nenhum</option>
                {lotes?.items?.map((l: any) => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Peso Inicial (kg)</label>
              <input type="number" step="0.1" value={pesoInicial} onChange={e => setPesoInicial(e.target.value)} placeholder="Opcional" className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={createAnimal.isPending} className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition">
              {createAnimal.isPending ? 'Criando...' : 'Criar Animal'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

