import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/auth';

interface Pai {
  id: string;
  nome: string;
  descricao: string | null;
  fazendaId: string;
  createdAt: string;
  updatedAt: string;
}

export function PaisPage() {
  const fazendaSelecionada = useAuthStore((s) => s.fazendaSelecionada);
  const queryClient = useQueryClient();

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const { data: pais = [] } = useQuery({
    queryKey: ['pais', fazendaSelecionada],
    queryFn: async () => {
      return apiFetch<Pai[]>(`/pais?fazendaId=${fazendaSelecionada}`);
    },
    enabled: !!fazendaSelecionada,
  });

  const createMutation = useMutation({
    mutationFn: async (body: { nome: string; descricao?: string }) => {
      await apiFetch('/pais', {
        method: 'POST',
        body: JSON.stringify({
          fazendaId: fazendaSelecionada,
          nome: body.nome,
          descricao: body.descricao || undefined,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pais'] });
      setNome('');
      setDescricao('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: { nome?: string; descricao?: string } }) => {
      await apiFetch(`/pais/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pais'] });
      setEditandoId(null);
      setNome('');
      setDescricao('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/pais/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pais'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    if (editandoId) {
      updateMutation.mutate({
        id: editandoId,
        body: { nome, descricao },
      });
    } else {
      createMutation.mutate({ nome, descricao });
    }
  };

  const handleEditar = (pai: Pai) => {
    setEditandoId(pai.id);
    setNome(pai.nome);
    setDescricao(pai.descricao || '');
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setNome('');
    setDescricao('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-green-200 p-8 mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-6">Pais</h1>

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Touro Nelore XYZ"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Informações adicionais sobre o pai..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50"
              >
                {editandoId ? 'Atualizar' : 'Criar Pai'}
              </button>
              {editandoId && (
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="space-y-4">
            {pais.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum pai cadastrado ainda.</p>
            ) : (
              pais.map((pai) => (
                <div
                  key={pai.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{pai.nome}</h3>
                      {pai.descricao && (
                        <p className="text-gray-600 mt-1">{pai.descricao}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditar(pai)}
                        className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:border-blue-500"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Deseja realmente excluir este pai?')) {
                            deleteMutation.mutate(pai.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:border-red-500 disabled:opacity-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
