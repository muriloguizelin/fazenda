import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { NavBar } from '../components/NavBar';

export function AnimalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: animal } = useQuery({ queryKey: ['animal', id], enabled: !!id, queryFn: () => apiFetch<any>(`/animais/${id}`) });
  const { data: hist } = useQuery({ queryKey: ['pesagens', id], enabled: !!id, queryFn: () => apiFetch<{ items: any[] }>(`/pesagens/${id}`) });

  const data = (hist?.items || []).slice().reverse().map(p => ({ data: new Date(p.data).toISOString().split('T')[0], peso: p.peso }));

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <NavBar />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Animal {animal?.brinco}</h2>
        <Link to={`/editar-animal/${id}`} className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition">
          Editar Animal
        </Link>
      </div>

      <div className="bg-white shadow rounded-xl p-6 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm text-slate-600">Brinco</div>
            <div className="font-medium">{animal?.brinco}</div>
          </div>
          <div>
            <div className="text-sm text-slate-600">Sexo</div>
            <div className="font-medium">{animal?.sexo || '-'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-600">Raça</div>
            <div className="font-medium">{animal?.raca || '-'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-600">Status</div>
            <div>
              <span className={`px-2 py-1 rounded text-xs ${animal?.status === 'ATIVO' ? 'bg-green-100 text-green-800' : animal?.status === 'MORTO' ? 'bg-red-100 text-red-800' : animal?.status === 'VENDIDO' ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'}`}>
                {animal?.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="font-medium mb-4">Histórico de Peso</h3>
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="peso" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {hist?.items && hist.items.length > 0 && (
        <div className="bg-white shadow rounded-xl p-6 mt-4">
          <h3 className="font-medium mb-4">Registros de Pesagem</h3>
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
                {hist.items.map((p: any) => (
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


