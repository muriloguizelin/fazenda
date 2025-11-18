import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { NavBar } from '../components/NavBar';
import { useState } from 'react';

export function AnimalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
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
            <div className="text-sm text-slate-600">Pai</div>
            <div className="font-medium">{animal?.pai?.brinco || 'Desconhecido'}</div>
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

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          📈 Histórico de Peso
        </h3>
        <div className="bg-white rounded-xl p-4 shadow-inner" style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="data" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px', 
                  color: 'white',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Line 
                type="monotone" 
                dataKey="peso" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ fill: '#10b981', r: 5 }}
                activeDot={{ r: 7, fill: '#059669' }}
                fill="url(#colorPeso)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Botão para abrir modal de histórico */}
      {hist?.items && hist.items.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
          >
            📊 Ver Histórico Completo de Pesagens
          </button>
        </div>
      )}

      {/* Modal de Histórico */}
      {showModal && hist?.items && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                📊 Histórico Completo - {animal?.brinco}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-700">Data</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Peso (kg)</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Flag</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hist.items.map((p: any, index: number) => (
                      <tr key={p.id} className={`border-t hover:bg-green-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {new Date(p.data).toLocaleDateString('pt-BR', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
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
            </div>

            {/* Footer do Modal */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
              <button 
                onClick={() => setShowModal(false)}
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


