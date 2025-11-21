import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { useAuthStore } from '../stores/auth';

export function IniciarPesagemPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fazendaId = useAuthStore(s => s.fazendaSelecionada);
  const [loteId, setLoteId] = useState('');
  const [busca, setBusca] = useState('');

  const { data: lotes } = useQuery({ queryKey: ['lotes', fazendaId], enabled: !!fazendaId, queryFn: () => apiFetch<{ items: any[] }>(`/lotes?fazendaId=${fazendaId}`) });

  const { data: animaisRaw } = useQuery({
    queryKey: ['animais', fazendaId, loteId],
    enabled: !!fazendaId,
    queryFn: () => {
      const qs = new URLSearchParams({ fazendaId, status: 'ATIVO' });
      if (loteId) qs.set('loteId', loteId);
      return apiFetch<{ items: any[] }>(`/animais?${qs.toString()}`);
    }
  });

  const animais = useMemo(() => {
    if (!animaisRaw?.items) return [];
    if (!busca) return animaisRaw.items;
    const b = busca.toUpperCase();
    return animaisRaw.items.filter((a: any) => a.brinco.includes(b) || a.prefixo.includes(b) || String(a.numero).includes(busca));
  }, [animaisRaw, busca]);

  const [pesos, setPesos] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Record<string, string>>({});
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});
  const [editando, setEditando] = useState<string | null>(null);

  const criarPesagem = useMutation({
    mutationFn: (data: any) => apiFetch('/pesagens', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['animais', 'pesagens'] }); setPesos({}); setFlags({}); setObservacoes({}); }
  });

  const salvarPesagem = (animalId: string) => {
    const peso = pesos[animalId];
    if (!peso || Number(peso) <= 0) return;
    criarPesagem.mutate({ animalId, peso: Number(peso), flag: flags[animalId] || 'ATIVO', observacao: observacoes[animalId] || undefined });
  };

  const { data: historicoPesagem } = useQuery({
    queryKey: ['pesagens', editando],
    enabled: !!editando,
    queryFn: () => apiFetch<{ items: any[] }>(`/pesagens/${editando}`)
  });

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <NavBar />
      <h2 className="text-2xl font-bold mb-6">Iniciar Pesagem</h2>

      <div className="bg-white shadow rounded-xl p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Lote</label>
            <select value={loteId} onChange={e => setLoteId(e.target.value)} className="w-full border rounded-lg px-3 py-2">
              <option value="">Todos</option>
              {lotes?.items?.map((l: any) => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Buscar (Brinco/Prefixo/Número)</label>
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Ex: ERO-123" className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 font-medium">Brinco</th>
                <th className="px-4 py-3 font-medium">Último Peso (kg)</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Novo Peso (kg)</th>
                <th className="px-4 py-3 font-medium">Flag</th>
                <th className="px-4 py-3 font-medium">Observação</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {animais?.map((a: any) => {
                const ultimoPeso = a.pesagens?.[0]?.peso || '-';
                return (
                  <tr key={a.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{a.brinco}</td>
                    <td className="px-4 py-3">{ultimoPeso}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${a.status === 'ATIVO' ? 'bg-green-100 text-green-800' : a.status === 'MORTO' ? 'bg-red-100 text-red-800' : a.status === 'VENDIDO' ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" step="0.1" value={pesos[a.id] || ''} onChange={e => setPesos({ ...pesos, [a.id]: e.target.value })} placeholder="0.0" className="w-24 border rounded px-2 py-1" />
                    </td>
                    <td className="px-4 py-3">
                      <select value={flags[a.id] || 'ATIVO'} onChange={e => setFlags({ ...flags, [a.id]: e.target.value })} className="border rounded px-2 py-1">
                        <option>ATIVO</option>
                        <option>MORTO</option>
                        <option>VENDIDO</option>
                        <option>DOENTE</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input value={observacoes[a.id] || ''} onChange={e => setObservacoes({ ...observacoes, [a.id]: e.target.value })} placeholder="Observação" className="w-48 border rounded px-2 py-1" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => salvarPesagem(a.id)} disabled={!pesos[a.id] || criarPesagem.isPending} className="bg-blue-600 text-white rounded px-3 py-1 text-sm hover:bg-blue-700 disabled:opacity-50">
                          Salvar
                        </button>
                        <button onClick={() => setEditando(editando === a.id ? null : a.id)} className="bg-slate-600 text-white rounded px-3 py-1 text-sm hover:bg-slate-700">
                          Histórico
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Histórico */}
      {editando && historicoPesagem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setEditando(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                📊 Histórico de Pesagens - {animais?.find((a: any) => a.id === editando)?.brinco}
              </h3>
              <button 
                onClick={() => setEditando(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {historicoPesagem.items && historicoPesagem.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-700">Data</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Peso (kg)</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Flag</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Observação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoPesagem.items.map((p: any, index: number) => (
                        <tr key={p.id} className={`border-t hover:bg-blue-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {new Date(p.data).toLocaleDateString('pt-BR', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                              {p.peso} kg
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              p.flag === 'ATIVO' ? 'bg-green-100 text-green-800' : 
                              p.flag === 'MORTO' ? 'bg-red-100 text-red-800' : 
                              p.flag === 'VENDIDO' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {p.flag}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{p.observacao || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-600 text-lg">Nenhuma pesagem encontrada</p>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
              <button 
                onClick={() => setEditando(null)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

