import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/auth';

export default function CriarFazendaPage() {
  const navigate = useNavigate();
  const setFazenda = useAuthStore(s => s.setFazenda);

  const [nome, setNome] = useState('');
  const [hectares, setHectares] = useState('');

  const criarFazenda = useMutation({
    mutationFn: async (data: any) => {
      return apiFetch<any>('/fazendas', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (fazenda) => {
      setFazenda(fazenda.id);
      navigate('/dashboard');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    criarFazenda.mutate({
      nome,
      hectares: hectares ? parseFloat(hectares) : undefined
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏡</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Criar Fazenda</h1>
            <p className="text-gray-600">Preencha as informações da sua fazenda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Fazenda *
              </label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Ex: Fazenda Santa Maria"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hectares (opcional)
              </label>
              <input
                type="number"
                step="0.01"
                value={hectares}
                onChange={e => setHectares(e.target.value)}
                placeholder="Ex: 150.5"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/selecionar-fazenda')}
                className="flex-1 border-2 border-gray-300 text-gray-700 rounded-lg px-4 py-3 hover:bg-gray-50 transition font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={criarFazenda.isPending}
                className="flex-1 bg-green-600 text-white rounded-lg px-4 py-3 hover:bg-green-700 transition font-semibold disabled:opacity-50"
              >
                {criarFazenda.isPending ? 'Criando...' : 'Criar Fazenda'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
