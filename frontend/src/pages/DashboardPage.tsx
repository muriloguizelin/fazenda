import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { data: fazendas } = useQuery({
    queryKey: ['fazendas'],
    queryFn: () => apiFetch<{ items: any[]; total: number; page: number; limit: number }>('/fazendas')
  });

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h2>Dashboard</h2>
      <nav style={{ marginBottom: 16 }}>
        <Link to="/animais">Animais</Link>
      </nav>
      <div>
        <h3>Fazendas</h3>
        <ul>
          {fazendas?.items?.map(f => (
            <li key={f.id}>{f.nome} {f.hectares ? `- ${f.hectares} ha` : ''}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}


