import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export function LotesPage() {
  const qc = useQueryClient();
  const { data: fazendas } = useQuery({ queryKey: ['fazendas'], queryFn: () => apiFetch<{ items: any[] }>('/fazendas') });
  const [fazendaId, setFazendaId] = useState('');
  useEffect(() => { if (fazendas?.items?.length && !fazendaId) setFazendaId(fazendas.items[0].id); }, [fazendas, fazendaId]);

  const { data: lotes } = useQuery({
    queryKey: ['lotes', fazendaId],
    enabled: !!fazendaId,
    queryFn: () => apiFetch<{ items: any[] }>(`/lotes?fazendaId=${fazendaId}`)
  });

  const createLote = useMutation({
    mutationFn: (body: any) => apiFetch('/lotes', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lotes'] })
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Lotes</h2>
      <div className="flex gap-2 mb-3 items-center">
        <select value={fazendaId} onChange={e => setFazendaId(e.target.value)} className="border rounded px-2 py-1">
          {fazendas?.items?.map((f: any) => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
      </div>

      <section className="bg-white shadow rounded-xl p-4 mb-4">
        <h3 className="font-medium mb-2">Criar Lote</h3>
        <CreateLoteForm fazendaId={fazendaId} onCreate={(data) => createLote.mutate(data)} />
      </section>

      <section className="bg-white shadow rounded-xl p-4 mb-4">
        <h3 className="font-medium mb-2">Lotes existentes</h3>
        <ul className="list-disc ml-5">
          {lotes?.items?.map((l: any) => (
            <li key={l.id}>{l.nome} {l.capacidade ? `- cap: ${l.capacidade}` : ''}</li>
          ))}
        </ul>
      </section>

      <section className="bg-white shadow rounded-xl p-4">
        <h3 className="font-medium mb-3">Iniciar Pesagem</h3>
        <PesagemForm fazendaId={fazendaId} />
      </section>
    </div>
  );
}

function CreateLoteForm({ fazendaId, onCreate }: { fazendaId: string; onCreate: (data: any) => void }) {
  const [nome, setNome] = useState('Lote 1');
  const [capacidade, setCapacidade] = useState('');
  const [area, setArea] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); onCreate({ fazendaId, nome, capacidade: capacidade? Number(capacidade): undefined, area: area? Number(area): undefined }); }} className="flex flex-wrap gap-2 items-center">
      <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} className="border rounded px-2 py-1" />
      <input placeholder="Capacidade" value={capacidade} onChange={e => setCapacidade(e.target.value)} className="border rounded px-2 py-1" />
      <input placeholder="Área (ha)" value={area} onChange={e => setArea(e.target.value)} className="border rounded px-2 py-1" />
      <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1">Criar</button>
    </form>
  );
}

function PesagemForm({ fazendaId }: { fazendaId: string }) {
  const qc = useQueryClient();
  const [prefixo, setPrefixo] = useState('');
  const [numero, setNumero] = useState('');
  const [peso, setPeso] = useState('');
  const [flag, setFlag] = useState('ATIVO');
  const [observacao, setObservacao] = useState('');
  const [animal, setAnimal] = useState<any | null>(null);

  const buscarAnimal = useMutation({
    mutationFn: async () => {
      const qs = new URLSearchParams({ fazendaId, prefixo, numero });
      const res = await apiFetch<{ items: any[] }>(`/animais?${qs.toString()}`);
      if (!res.items.length) throw new Error('Animal não encontrado');
      return res.items[0];
    },
    onSuccess: (a) => setAnimal(a)
  });

  const criarPesagem = useMutation({
    mutationFn: (data: any) => apiFetch('/pesagens', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { setAnimal(null); setPeso(''); setObservacao(''); qc.invalidateQueries({ queryKey: ['animais'] }); }
  });

  return (
    <div className="border border-slate-200 rounded-xl p-3">
      <form onSubmit={(e) => { e.preventDefault(); buscarAnimal.mutate(); }} className="flex gap-2 flex-wrap items-center">
        <input placeholder="Prefixo (3-4 letras)" value={prefixo} onChange={e => setPrefixo(e.target.value.toUpperCase())} className="border rounded px-2 py-1 w-[140px]" />
        <input placeholder="Número (1-10000)" value={numero} onChange={e => setNumero(e.target.value)} className="border rounded px-2 py-1 w-[140px]" />
        <button type="submit" className="bg-slate-700 text-white rounded px-3 py-1">Buscar animal</button>
        {buscarAnimal.isError && <span className="text-red-600">Animal não encontrado</span>}
      </form>

      {animal && (
        <div className="mt-3">
          <div className="mb-2 font-medium">Selecionado: {animal.brinco}</div>
          <form onSubmit={(e) => { e.preventDefault(); criarPesagem.mutate({ animalId: animal.id, peso: Number(peso), flag, observacao }); }} className="flex gap-2 flex-wrap items-center">
            <input placeholder="Peso (kg)" value={peso} onChange={e => setPeso(e.target.value)} className="border rounded px-2 py-1" />
            <select value={flag} onChange={e => setFlag(e.target.value)} className="border rounded px-2 py-1">
              <option>ATIVO</option><option>MORTO</option><option>VENDIDO</option><option>DOENTE</option>
            </select>
            <input placeholder="Observação" value={observacao} onChange={e => setObservacao(e.target.value)} className="border rounded px-2 py-1 w-[220px]" />
            <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1">Salvar pesagem</button>
            {criarPesagem.isSuccess && <span className="text-green-600">Salvo!</span>}
          </form>
        </div>
      )}
    </div>
  );
}


