import { useEffect, useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '../components/NavBar';

export function IniciarPesagemPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: fazendas } = useQuery({ queryKey: ['fazendas'], queryFn: () => apiFetch<{ items: any[] }>('/fazendas') });
  const [fazendaId, setFazendaId] = useState('');
  const [loteId, setLoteId] = useState('');
  const [busca, setBusca] = useState('');
  useEffect(() => { if (fazendas?.items?.length && !fazendaId) setFazendaId(fazendas.items[0].id); }, [fazendas, fazendaId]);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fazenda</label>
            <select value={fazendaId} onChange={e => { setFazendaId(e.target.value); setLoteId(''); }} className="w-full border rounded-lg px-3 py-2">
              {fazendas?.items?.map((f: any) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
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
                          {editando === a.id ? 'Fechar' : 'Histórico'}
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

      {editando && historicoPesagem && (
        <div className="mt-4 bg-white shadow rounded-xl p-4">
          <h3 className="font-medium mb-3">Histórico de Pesagens - {animais?.find((a: any) => a.id === editando)?.brinco}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2">Data</th>
                  <th className="px-3 py-2">Peso (kg)</th>
                  <th className="px-3 py-2">Flag</th>
                  <th className="px-3 py-2">Observação</th>
                </tr>
              </thead>
              <tbody>
                {historicoPesagem.items?.map((p: any) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2">{new Date(p.data).toLocaleDateString('pt-BR')}</td>
                    <td className="px-3 py-2">{p.peso}</td>
                    <td className="px-3 py-2">{p.flag}</td>
                    <td className="px-3 py-2">{p.observacao || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

