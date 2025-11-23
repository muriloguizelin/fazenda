import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiFetch } from '../lib/api';
import { Link } from 'react-router-dom';
import { FarmMap } from '../components/FarmMap';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { NavBar } from '../components/NavBar';
import { useAuthStore } from '../stores/auth';

export function DashboardPage() {
  const fazendaId = useAuthStore(s => s.fazendaSelecionada);
  const queryClient = useQueryClient();

  const { data: farm } = useQuery({
    queryKey: ['fazenda', fazendaId],
    enabled: !!fazendaId,
    queryFn: () => apiFetch<any>(`/fazendas/${fazendaId}`)
  });

  const [days, setDays] = useState(30);
  const [loteId, setLoteId] = useState('');

  const [isMapping, setIsMapping] = useState(false);
  const [boundary, setBoundary] = useState<[number, number][]>([]);

  const updateFarmMutation = useMutation({
    mutationFn: async () => {
      if (!fazendaId) return;
      return apiFetch(`/fazendas/${fazendaId}`, {
        method: 'PUT',
        body: JSON.stringify({
          localizacao: {
            ...farm?.localizacao,
            boundary: boundary
          }
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fazenda', fazendaId] });
      setIsMapping(false);
    }
  });

  const { data: lotes } = useQuery({
    queryKey: ['lotes', fazendaId],
    enabled: !!fazendaId,
    queryFn: () => apiFetch<{ items: any[] }>(`/lotes?fazendaId=${fazendaId}`)
  });

  const { data: metric } = useQuery({
    queryKey: ['metrics', days, fazendaId, loteId],
    enabled: !!fazendaId,
    queryFn: () => {
      const params = new URLSearchParams({ fazendaId: fazendaId!, days: String(days) });
      if (loteId) params.set('loteId', loteId);
      return apiFetch<{ points: { date: string; avg: number }[] }>(`/metrics/peso?${params.toString()}`);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <NavBar />

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                🌿 {farm?.nome || 'Dashboard'}
              </h1>
              <p className="text-gray-600 text-lg">Gerencie seu rebanho de forma inteligente</p>
            </div>
            {farm?.hectares && (
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-4 text-center shadow-md">
                <div className="text-3xl font-bold">{farm.hectares}</div>
                <div className="text-sm opacity-90">Hectares</div>
              </div>
            )}
          </div>
        </div>

        {/* Ações Rápidas */}
        <h3 className="text-xl font-bold text-gray-800 mb-4">⚡ Ações Rápidas</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link to="/animais" className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all text-center border-2 border-transparent hover:border-green-500 group">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🐄</div>
            <div className="font-semibold text-gray-700 group-hover:text-green-600">Animais</div>
          </Link>
          <Link to="/lotes" className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all text-center border-2 border-transparent hover:border-blue-500 group">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📦</div>
            <div className="font-semibold text-gray-700 group-hover:text-blue-600">Lotes</div>
          </Link>
          <Link to="/iniciar-pesagem" className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all text-center border-2 border-transparent hover:border-orange-500 group">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚖️</div>
            <div className="font-semibold text-gray-700 group-hover:text-orange-600">Iniciar Pesagem</div>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                📊 Evolução de Peso (Média)
              </h3>
              <p className="text-sm text-gray-600 mt-1">Acompanhe o ganho de peso médio do rebanho</p>
            </div>
            <div className="flex gap-2">
              {[7, 30, 90, 180].map(d => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${days === d
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-inner" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metric?.points || []} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
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
                  dataKey="avg"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6, fill: '#1d4ed8' }}
                  fill="url(#colorAvg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-600"></div>
              <span className="text-gray-700">Peso médio do rebanho</span>
            </div>
            {metric?.points && metric.points.length > 0 && (
              <div className="text-gray-600">
                <span className="font-semibold">Total de registros:</span> {metric.points.length}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🗺️ Mapa da Fazenda
            </h3>
            {!isMapping ? (
              <button
                onClick={() => {
                  setIsMapping(true);
                  if (farm?.localizacao?.boundary) {
                    setBoundary(farm.localizacao.boundary);
                  }
                }}
                className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1"
              >
                ✏️ Mapear Divisas
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setBoundary((prev) => prev.slice(0, -1));
                  }}
                  className="text-gray-600 hover:text-gray-800 font-semibold text-sm px-2"
                  title="Desfazer último ponto"
                >
                  ↩️
                </button>
                <button
                  onClick={() => setBoundary([])}
                  className="text-red-600 hover:text-red-800 font-semibold text-sm px-2"
                  title="Limpar tudo"
                >
                  🗑️
                </button>
                <button
                  onClick={() => setIsMapping(false)}
                  className="text-gray-600 hover:text-gray-800 font-semibold text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => updateFarmMutation.mutate()}
                  disabled={updateFarmMutation.isPending}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateFarmMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            )}
          </div>
          <FarmMap
            boundary={isMapping ? boundary : (farm?.localizacao?.boundary || [])}
            editMode={isMapping}
            onAddPoint={(pos) => setBoundary(prev => [...prev, pos])}
          />
        </div>
      </div>
    </div>
  );
}
