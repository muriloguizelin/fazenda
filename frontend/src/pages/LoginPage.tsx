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
    <div style={{ maxWidth: 360, margin: '64px auto', fontFamily: 'sans-serif' }}>
      <h1>Entrar</h1>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Senha</label>
          <input value={senha} onChange={e => setSenha(e.target.value)} type="password" style={{ width: '100%' }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <button disabled={loading} type="submit">{loading ? 'Entrando...' : 'Entrar'}</button>
      </form>
    </div>
  );
}


