import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { Link } from 'react-router-dom';
import { NavBar } from '../components/NavBar';

export function AnimaisPage() {
  const [fazendaId, setFazendaId] = useState<string>('');
  const [prefixo, setPrefixo] = useState('');
  const [numero, setNumero] = useState('');

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

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <NavBar />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Visualizar Animais</h2>
        <Link to="/criar-animal" className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition">
          + Criar Animal
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-xl p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <label className="block text-sm font-medium mb-1">Fazenda</label>
            <select value={fazendaId} onChange={e => setFazendaId(e.target.value)} className="border rounded-lg px-3 py-2">
              {fazendas?.items?.map((f: any) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prefixo</label>
            <input placeholder="Ex: ERO" value={prefixo} onChange={e => setPrefixo(e.target.value.toUpperCase())} className="border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Número</label>
            <input placeholder="Ex: 123" type="number" value={numero} onChange={e => setNumero(e.target.value)} className="border rounded-lg px-3 py-2" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 font-medium">Brinco</th>
                  <th className="px-4 py-3 font-medium">Sexo</th>
                  <th className="px-4 py-3 font-medium">Raça</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Lote</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {animais?.items?.map((a: any) => (
                  <tr key={a.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{a.brinco}</td>
                    <td className="px-4 py-3">{a.sexo || '-'}</td>
                    <td className="px-4 py-3">{a.raca || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${a.status === 'ATIVO' ? 'bg-green-100 text-green-800' : a.status === 'MORTO' ? 'bg-red-100 text-red-800' : a.status === 'VENDIDO' ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{a.loteId || '-'}</td>
                    <td className="px-4 py-3">
                      <Link to={`/animal/${a.id}`} className="text-blue-600 hover:underline">Ver detalhes</Link>
                    </td>
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


