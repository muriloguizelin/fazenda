import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { NavBar } from '../components/NavBar';
import { useAuthStore } from '../stores/auth';
import { Link } from 'react-router-dom';

interface Lote {
  id: string;
  nome: string;
  capacidade?: number;
  prefixo?: string;
  _count?: {
    animais: number;
  };
}

interface Animal {
  id: string;
  brinco: string;
  sexo: string;
  status: string;
  pai?: {
    id: string;
    nome: string;
  };
}

export function LotesPage() {
  const fazendaId = useAuthStore(s => s.fazendaSelecionada);
  const [activeTab, setActiveTab] = useState<'listar' | 'criar'>('listar');
  const [selectedLote, setSelectedLote] = useState<string | null>(null);
  const [editandoLote, setEditandoLote] = useState<Lote | null>(null);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <NavBar />
        
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => {
                  setActiveTab('listar');
                  setSelectedLote(null);
                  setEditandoLote(null);
                }}
                className={`px-6 py-3 font-semibold ${activeTab === 'listar' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                📦 Lotes
              </button>
              <button
                onClick={() => {
                  setActiveTab('criar');
                  setSelectedLote(null);
                  setEditandoLote(null);
                }}
                className={`px-6 py-3 font-semibold ${activeTab === 'criar' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                ➕ Criar Lote
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === 'listar' && !selectedLote && !editandoLote && <ListarLotesTab fazendaId={fazendaId!} onSelectLote={setSelectedLote} onEditLote={setEditandoLote} />}
            {activeTab === 'listar' && selectedLote && <AnimaisDoLoteTab loteId={selectedLote} onBack={() => setSelectedLote(null)} />}
            {activeTab === 'criar' && <CriarLoteTab fazendaId={fazendaId!} />}
            {editandoLote && <EditarLoteTab lote={editandoLote} onClose={() => setEditandoLote(null)} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListarLotesTab({ fazendaId, onSelectLote, onEditLote }: { fazendaId: string; onSelectLote: (id: string) => void; onEditLote: (lote: Lote) => void }) {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['lotes', fazendaId],
    queryFn: () => apiFetch<{ items: Lote[] }>(`/lotes?fazendaId=${fazendaId}&limit=100`).then(r => r.items),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/lotes/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lotes'] }),
  });

  if (isLoading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📦 Lotes</h2>
      
      {!data?.length && (
        <div className="text-center py-8 text-gray-500">
          Nenhum lote cadastrado ainda.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map(lote => (
          <div key={lote.id} className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-4 shadow hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-gray-800">{lote.nome}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditLote(lote)}
                  className="text-blue-600 hover:text-blue-700"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Deletar lote "${lote.nome}"?`)) {
                      deleteMutation.mutate(lote.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                  title="Deletar"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-3">
              {lote.prefixo && <div>Prefixo: <span className="font-semibold">{lote.prefixo}</span></div>}
              {lote.capacidade && <div>Capacidade: <span className="font-semibold">{lote.capacidade}</span></div>}
              <div>Animais: <span className="font-semibold">{lote._count?.animais ?? 0}</span></div>
            </div>

            <button
              onClick={() => onSelectLote(lote.id)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Ver Animais
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnimaisDoLoteTab({ loteId, onBack }: { loteId: string; onBack: () => void }) {
  const { data: lote } = useQuery({
    queryKey: ['lote', loteId],
    queryFn: () => apiFetch<Lote>(`/lotes/${loteId}`),
  });

  const { data: animais, isLoading } = useQuery({
    queryKey: ['animais-lote', loteId],
    queryFn: () => apiFetch<{ items: Animal[] }>(`/animais?loteId=${loteId}&limit=1000`).then(r => r.items),
  });

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-blue-600 hover:text-blue-700 font-semibold">
        ← Voltar para Lotes
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🐄 Animais do Lote: {lote?.nome}
      </h2>

      {isLoading && <div className="text-center py-8">Carregando...</div>}

      {!isLoading && !animais?.length && (
        <div className="text-center py-8 text-gray-500">
          Nenhum animal neste lote ainda.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {animais?.map(animal => (
          <Link
            key={animal.id}
            to={`/animal/${animal.id}`}
            className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{animal.sexo === 'MACHO' ? '🐂' : '🐄'}</span>
              <div>
                <div className="font-bold text-gray-800">{animal.brinco}</div>
                <div className="text-xs text-gray-500">{animal.status}</div>
              </div>
            </div>
            {animal.pai && (
              <div className="text-sm text-gray-600 mt-2">
                Pai: <span className="font-semibold">{animal.pai.nome}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function CriarLoteTab({ fazendaId }: { fazendaId: string }) {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState('');
  const [prefixo, setPrefixo] = useState('');
  const [capacidade, setCapacidade] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => apiFetch('/lotes', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
      setNome('');
      setPrefixo('');
      setCapacidade('');
      alert('Lote criado com sucesso!');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      fazendaId,
      nome,
      prefixo: prefixo || undefined,
      capacidade: capacidade ? Number(capacidade) : undefined,
    });
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">➕ Criar Novo Lote</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nome do Lote *
          </label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Prefixo (opcional)
          </label>
          <input
            type="text"
            value={prefixo}
            onChange={e => setPrefixo(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Capacidade (opcional)
          </label>
          <input
            type="number"
            value={capacidade}
            onChange={e => setCapacidade(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {createMutation.isPending ? 'Criando...' : 'Criar Lote'}
        </button>
      </form>
    </div>
  );
}

function EditarLoteTab({ lote, onClose }: { lote: Lote; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState(lote.nome);
  const [prefixo, setPrefixo] = useState(lote.prefixo || '');
  const [capacidade, setCapacidade] = useState(lote.capacidade?.toString() || '');

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiFetch(`/lotes/${lote.id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
      alert('Lote atualizado com sucesso!');
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      nome,
      prefixo: prefixo || undefined,
      capacidade: capacidade ? Number(capacidade) : undefined,
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">✏️ Editar Lote</h2>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800 font-semibold">
          ✕ Fechar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nome do Lote *
          </label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Prefixo (opcional)
          </label>
          <input
            type="text"
            value={prefixo}
            onChange={e => setPrefixo(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Capacidade (opcional)
          </label>
          <input
            type="number"
            value={capacidade}
            onChange={e => setCapacidade(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}
