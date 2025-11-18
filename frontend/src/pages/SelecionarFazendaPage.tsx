import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/auth';

export default function SelecionarFazendaPage() {
  const navigate = useNavigate();
  const setFazenda = useAuthStore(s => s.setFazenda);

  const { data: fazendas, isLoading } = useQuery({
    queryKey: ['fazendas'],
    queryFn: async () => {
      return apiFetch<any>('/fazendas');
    }
  });

  const handleSelectFazenda = (fazenda: any) => {
    setFazenda(fazenda.id);
    navigate('/dashboard');
  };

  const handleCreateFazenda = () => {
    navigate('/criar-fazenda');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Carregando fazendas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Selecione uma Fazenda</h1>
          <p className="text-gray-600">Escolha a fazenda que deseja gerenciar</p>
        </div>

        {fazendas?.items?.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">🏡</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Nenhuma fazenda cadastrada</h2>
            <p className="text-gray-600 mb-6">Comece criando sua primeira fazenda</p>
            <button
              onClick={handleCreateFazenda}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Criar Primeira Fazenda
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {fazendas?.items?.map((fazenda: any) => (
                <button
                  key={fazenda.id}
                  onClick={() => handleSelectFazenda(fazenda)}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">🌾</div>
                    <div className="text-green-600 opacity-0 group-hover:opacity-100 transition">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{fazenda.nome}</h3>
                  {fazenda.hectares && (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{fazenda.hectares}</span> hectares
                    </p>
                  )}
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleCreateFazenda}
                className="bg-white text-green-600 border-2 border-green-600 px-8 py-3 rounded-lg hover:bg-green-50 transition font-semibold"
              >
                + Criar Nova Fazenda
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
