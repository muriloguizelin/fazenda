import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export function AnimaisPage() {
  const [fazendaId, setFazendaId] = useState<string>('');
  const [prefixo, setPrefixo] = useState('');
  const [numero, setNumero] = useState('');
  const queryClient = useQueryClient();

  const { data: fazendas } = useQuery({ queryKey: ['fazendas'], queryFn: () => apiFetch<{ items: any[] }>('/fazendas') });
  useEffect(() => { if (fazendas?.items?.length && !fazendaId) setFazendaId(fazendas.items[0].id); }, [fazendas, fazendaId]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (fazendaId) p.set('fazendaId', fazendaId);
    if (prefixo) p.set('prefixo', prefixo);
    if (numero) p.set('numero', numero);
    return p.toString();
  }, [fazendaId, prefixo, numero]);

  const { data: animais, isLoading } = useQuery({
    queryKey: ['animais', query],
    enabled: !!fazendaId,
    queryFn: () => apiFetch<{ items: any[]; total: number }>(`/animais?${query}`)
  });

  const createAnimal = useMutation({
    mutationFn: (body: any) => apiFetch('/animais', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['animais'] })
  });

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h2>Animais</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <select value={fazendaId} onChange={e => setFazendaId(e.target.value)}>
          {fazendas?.items?.map((f: any) => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
        <input placeholder="Prefixo" value={prefixo} onChange={e => setPrefixo(e.target.value.toUpperCase())} />
        <input placeholder="Número" value={numero} onChange={e => setNumero(e.target.value)} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <CreateAnimalForm fazendaId={fazendaId} onCreate={(a) => createAnimal.mutate(a)} />
      </div>
      {isLoading ? 'Carregando...' : (
        <table border={1} cellPadding={6}>
          <thead>
            <tr>
              <th>Brinco</th><th>Sexo</th><th>Status</th><th>Lote</th>
            </tr>
          </thead>
          <tbody>
            {animais?.items?.map((a: any) => (
              <tr key={a.id}>
                <td>{a.brinco}</td>
                <td>{a.sexo}</td>
                <td>{a.status}</td>
                <td>{a.loteId || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function CreateAnimalForm({ fazendaId, onCreate }: { fazendaId: string; onCreate: (b: any) => void }) {
  const [prefixo, setPrefixo] = useState('ERO');
  const [numero, setNumero] = useState('1');
  const [sexo, setSexo] = useState('MACHO');
  return (
    <form onSubmit={(e) => { e.preventDefault(); onCreate({ fazendaId, prefixo, numero: Number(numero), sexo }); }}>
      <b>Novo animal: </b>
      <input value={prefixo} onChange={e => setPrefixo(e.target.value.toUpperCase())} style={{ width: 60 }} />
      <input value={numero} onChange={e => setNumero(e.target.value)} style={{ width: 80 }} />
      <select value={sexo} onChange={e => setSexo(e.target.value)}>
        <option>MACHO</option><option>FEMEA</option><option>DESCONHECIDO</option>
      </select>
      <button type="submit">Criar</button>
    </form>
  );
}


