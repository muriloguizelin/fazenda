import { useState } from 'react';
import { useAuthStore } from '../stores/auth';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const [email, setEmail] = useState('admin@demo.com');
  const [senha, setSenha] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore(s => s.setAuth);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await apiFetch<{ accessToken: string, user: any }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) });
      setAuth(res.accessToken, res.user);
      navigate('/');
    } catch (err: any) {
      setError(err?.error?.message || 'Falha no login');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-sm bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Entrar</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Senha</label>
            <input value={senha} onChange={e => setSenha(e.target.value)} type="password" className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}


