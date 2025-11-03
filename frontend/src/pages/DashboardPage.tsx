import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { apiFetch } from '../lib/api';
import { Link } from 'react-router-dom';
import { FarmMap } from '../components/FarmMap';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { NavBar } from '../components/NavBar';

export function DashboardPage() {
  const { data: fazendas } = useQuery({
    queryKey: ['fazendas'],
    queryFn: () => apiFetch<{ items: any[]; total: number; page: number; limit: number }>('/fazendas')
  });

  const farm = fazendas?.items?.[0];
  const center = farm?.localizacao?.center as [number, number] | undefined;
  const zoom = farm?.localizacao?.zoom || 12;
  const bounds = farm?.localizacao?.bounds as [number, number][] | undefined;

  const [days, setDays] = useState(30);
  const { data: metric } = useQuery({
    queryKey: ['metrics', days, farm?.id],
    enabled: !!farm?.id,
    queryFn: () => apiFetch<{ points: { date: string; avg: number }[] }>(`/metrics/peso?fazendaId=${farm!.id}&days=${days}`)
  });
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <NavBar />
      <h2 className="text-2xl font-bold mb-6">🐄 Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Link to="/criar-lote" className="bg-white shadow rounded-xl p-4 hover:shadow-lg transition text-center">
          <div className="text-3xl mb-2">📦</div>
          <div className="font-medium">Criar Lote</div>
        </Link>
        <Link to="/criar-animal" className="bg-white shadow rounded-xl p-4 hover:shadow-lg transition text-center">
          <div className="text-3xl mb-2">🐄</div>
          <div className="font-medium">Criar Animal</div>
        </Link>
        <Link to="/criar-animais-lote" className="bg-white shadow rounded-xl p-4 hover:shadow-lg transition text-center">
          <div className="text-3xl mb-2">🐄🐄</div>
          <div className="font-medium">Criar em Lote</div>
        </Link>
        <Link to="/animais" className="bg-white shadow rounded-xl p-4 hover:shadow-lg transition text-center">
          <div className="text-3xl mb-2">📋</div>
          <div className="font-medium">Ver Animais</div>
        </Link>
        <Link to="/iniciar-pesagem" className="bg-white shadow rounded-xl p-4 hover:shadow-lg transition text-center">
          <div className="text-3xl mb-2">⚖️</div>
          <div className="font-medium">Iniciar Pesagem</div>
        </Link>
      </div>
      <div className="bg-white shadow rounded-xl p-4 mb-4">
        <h3 className="font-medium mb-2">Fazendas</h3>
        <ul className="list-disc ml-5">
          {fazendas?.items?.map(f => (
            <li key={f.id}>{f.nome} {f.hectares ? `- ${f.hectares} ha` : ''}</li>
          ))}
        </ul>
      </div>
      <div className="bg-white shadow rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Variação de peso (média)</h3>
          <div className="flex gap-2">
            {[7,30,120].map(d => (
              <button key={d} onClick={() => setDays(d)} className={`px-3 py-1 rounded ${days===d? 'bg-blue-600 text-white':'bg-slate-100'}`}>{d}d</button>
            ))}
          </div>
        </div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metric?.points || []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avg" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-4">
        <h3 className="font-medium mb-2">Mapa da Fazenda</h3>
        <FarmMap center={center ?? undefined} zoom={zoom} bounds={bounds} />
      </div>
    </div>
  );
}


