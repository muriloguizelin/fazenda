import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { Link } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { useAuthStore } from '../stores/auth';

export function AnimaisPage() {
  const fazendaId = useAuthStore(s => s.fazendaSelecionada);
  const [activeTab, setActiveTab] = useState<'listar' | 'criar-animal' | 'pais' | 'criar-lote'>('listar');
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <NavBar />
        <div className="bg-white rounded-xl shadow-lg border border-green-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('listar')}
                className={`px-6 py-3 font-semibold ${activeTab === 'listar' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Animais
              </button>
              <button
                onClick={() => setActiveTab('criar-animal')}
                className={`px-6 py-3 font-semibold ${activeTab === 'criar-animal' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Criar Animal
              </button>
              <button
                onClick={() => setActiveTab('pais')}
                className={`px-6 py-3 font-semibold ${activeTab === 'pais' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Pais
              </button>
              <button
                onClick={() => setActiveTab('criar-lote')}
                className={`px-6 py-3 font-semibold ${activeTab === 'criar-lote' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Criar Lote
              </button>
            </div>
          </div>
          <div className="p-6">
            {activeTab === 'listar' && <ListarAnimaisTab fazendaId={fazendaId!} />}
            {activeTab === 'criar-animal' && <CriarAnimalTab fazendaId={fazendaId!} />}
            {activeTab === 'pais' && <PaisTab fazendaId={fazendaId!} />}
            {activeTab === 'criar-lote' && <CriarLoteTab fazendaId={fazendaId!} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListarAnimaisTab({ fazendaId }: { fazendaId: string }) {
  const [prefixo, setPrefixo] = useState('');
  const [numero, setNumero] = useState('');

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (fazendaId) p.set('fazendaId', fazendaId);
    if (prefixo) p.set('prefixo', prefixo);
    if (numero) p.set('numero', numero);
    return p.toString();
  }, [fazendaId, prefixo, numero]);

  const { data: animais, isLoading } = useQuery({
    queryKey: ['animais', query],
    enabled: !!fazendaId,
    queryFn: () => apiFetch<{ items: any[]; total: number }>(`/animais?${query}`)
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prefixo</label>
          <input
            placeholder="Ex: ERO"
            value={prefixo}
            onChange={e => setPrefixo(e.target.value.toUpperCase())}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
          <input
            placeholder="Ex: 123"
            type="number"
            value={numero}
            onChange={e => setNumero(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Carregando...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-green-100 to-green-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">Brinco</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Sexo</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Pai</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Lote</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {animais?.items?.map((a: any) => (
                <tr key={a.id} className="border-t border-gray-200 hover:bg-green-50 transition">
                  <td className="px-4 py-3 font-medium">{a.brinco}</td>
                  <td className="px-4 py-3">{a.sexo || '-'}</td>
                  <td className="px-4 py-3">{a.pai?.nome || 'Desconhecido'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${a.status === 'ATIVO' ? 'bg-green-100 text-green-800' :
                        a.status === 'MORTO' ? 'bg-red-100 text-red-800' :
                          a.status === 'VENDIDO' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-orange-100 text-orange-800'
                      }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{a.lote?.nome || '-'}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/animal/${a.id}`}
                      className="text-green-600 hover:text-green-800 font-semibold hover:underline"
                    >
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CriarAnimalTab({ fazendaId }: { fazendaId: string }) {
  const qc = useQueryClient();

  const { data: lotes } = useQuery({
    queryKey: ['lotes', fazendaId],
    enabled: !!fazendaId,
    queryFn: () => apiFetch<{ items: any[] }>(`/lotes?fazendaId=${fazendaId}`)
  });

  const { data: prefixosData } = useQuery({
    queryKey: ['prefixos', fazendaId],
    enabled: !!fazendaId,
    queryFn: () => apiFetch<{ prefixos: string[] }>(`/animais/prefixos?fazendaId=${fazendaId}`)
  });

  const { data: pais } = useQuery({
    queryKey: ['pais', fazendaId],
    enabled: !!fazendaId,
    queryFn: () => apiFetch<any[]>(`/pais?fazendaId=${fazendaId}`)
  });

  const createAnimal = useMutation({
    mutationFn: (body: any) => apiFetch('/animais', { method: 'POST', body: JSON.stringify(body) }),
  });

  const criarPesagemInicial = useMutation({
    mutationFn: (data: any) => apiFetch('/pesagens', { method: 'POST', body: JSON.stringify(data) }),
  });

  const [prefixo, setPrefixo] = useState('');
  const [novoPrefixo, setNovoPrefixo] = useState('');
  const [usarNovoPrefixo, setUsarNovoPrefixo] = useState(false);
  const [numero, setNumero] = useState('');
  const [sexo, setSexo] = useState('MACHO');
  const [paiId, setPaiId] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [origem, setOrigem] = useState('');
  const [loteId, setLoteId] = useState('');
  const [pesoInicial, setPesoInicial] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prefixoFinal = usarNovoPrefixo ? novoPrefixo : prefixo;
    const animalData = {
      fazendaId,
      prefixo: prefixoFinal,
      numero: Number(numero),
      sexo,
      paiId: paiId || undefined,
      nascimento: nascimento || undefined,
      origem: origem || undefined,
      loteId: loteId || undefined
    };
    const created = await createAnimal.mutateAsync(animalData) as any;
    if (pesoInicial && Number(pesoInicial) > 0) {
      await criarPesagemInicial.mutateAsync({
        animalId: created.id,
        peso: Number(pesoInicial),
        flag: 'ATIVO',
        observacao: 'Peso inicial'
      });
    }
    qc.invalidateQueries({ queryKey: ['animais'] });
    qc.invalidateQueries({ queryKey: ['pesagens'] });

    // Reset form
    setPrefixo('');
    setNovoPrefixo('');
    setNumero('');
    setSexo('MACHO');
    setPaiId('');
    setNascimento('');
    setOrigem('');
    setLoteId('');
    setPesoInicial('');
    setUsarNovoPrefixo(false);
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Criar Novo Animal</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prefixo</label>
            {!usarNovoPrefixo ? (
              <div className="space-y-2">
                <select
                  value={prefixo}
                  onChange={e => setPrefixo(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione um prefixo</option>
                  {prefixosData?.prefixos?.map((p: string) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setUsarNovoPrefixo(true)}
                  className="text-sm text-green-600 hover:underline font-medium"
                >
                  + Criar novo prefixo
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  value={novoPrefixo}
                  onChange={e => setNovoPrefixo(e.target.value.toUpperCase())}
                  required
                  maxLength={4}
                  placeholder="Novo prefixo (3-4 letras)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => setUsarNovoPrefixo(false)}
                  className="text-sm text-gray-600 hover:underline"
                >
                  ← Voltar para lista
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Número (1-10000)</label>
            <input
              type="number"
              min="1"
              max="10000"
              value={numero}
              onChange={e => setNumero(e.target.value)}
              required
              placeholder="123"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
            <select
              value={sexo}
              onChange={e => setSexo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option>MACHO</option>
              <option>FEMEA</option>
              <option>DESCONHECIDO</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pai (Touro)</label>
            <select
              value={paiId}
              onChange={e => setPaiId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Nenhum / Desconhecido</option>
              {pais?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
            <input
              type="date"
              value={nascimento}
              onChange={e => setNascimento(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Origem</label>
            <input
              value={origem}
              onChange={e => setOrigem(e.target.value)}
              placeholder="Compra, Nascido..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lote</label>
            <select
              value={loteId}
              onChange={e => setLoteId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Nenhum</option>
              {lotes?.items?.map((l: any) => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Peso Inicial (kg)</label>
            <input
              type="number"
              step="0.1"
              value={pesoInicial}
              onChange={e => setPesoInicial(e.target.value)}
              placeholder="Opcional"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={createAnimal.isPending}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg px-6 py-3 font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition"
          >
            {createAnimal.isPending ? 'Criando...' : 'Criar Animal'}
          </button>
        </div>
        {createAnimal.isSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-green-700 font-medium">✅ Animal criado com sucesso!</p>
          </div>
        )}
      </form>
    </div>
  );
}

function CriarLoteTab({ fazendaId }: { fazendaId: string }) {
  const qc = useQueryClient();
  const [nome, setNome] = useState('');
  const [prefixo, setPrefixo] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [animaisSelecionados, setAnimaisSelecionados] = useState<string[]>([]);
  const [prefixoPadrao, setPrefixoPadrao] = useState('');
  const [novosAnimais, setNovosAnimais] = useState<Array<{ id: string; numero: string; sexo: string; peso: string; paiId: string }>>([]);

  const { data: animais } = useQuery({
    queryKey: ['animais', fazendaId, { status: 'ATIVO' }],
    queryFn: () => apiFetch<{ items: any[] }>(`/animais?fazendaId=${fazendaId}&status=ATIVO&limit=1000`),
    enabled: !!fazendaId,
  });

  const { data: pais } = useQuery({
    queryKey: ['pais', fazendaId],
    enabled: !!fazendaId,
    queryFn: () => apiFetch<any[]>(`/pais?fazendaId=${fazendaId}`)
  });

  const createLote = useMutation({
    mutationFn: (body: any) => apiFetch('/lotes', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lotes', 'animais'] });
      setNome('');
      setPrefixo('');
      setCapacidade('');
      setAnimaisSelecionados([]);
      setPrefixoPadrao('');
      setNovosAnimais([]);
    }
  });

  const createAnimal = useMutation({
    mutationFn: (body: any) => apiFetch('/animais', { method: 'POST', body: JSON.stringify(body) }),
  });

  const criarPesagem = useMutation({
    mutationFn: (data: any) => apiFetch('/pesagens', { method: 'POST', body: JSON.stringify(data) }),
  });

  const toggleAnimal = (id: string) => {
    setAnimaisSelecionados(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const adicionarNovoAnimal = () => {
    setNovosAnimais(prev => [...prev, {
      id: Math.random().toString(),
      numero: '',
      sexo: 'MACHO',
      peso: '',
      paiId: ''
    }]);
  };

  const removerNovoAnimal = (id: string) => {
    setNovosAnimais(prev => prev.filter(a => a.id !== id));
  };

  const atualizarNovoAnimal = (id: string, campo: string, valor: string) => {
    setNovosAnimais(prev => prev.map(a =>
      a.id === id ? { ...a, [campo]: valor } : a
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const animaisCriadosIds: string[] = [];

      for (const novoAnimal of novosAnimais) {
        if (novoAnimal.numero) {
          const animalData = {
            fazendaId,
            prefixo: prefixoPadrao || prefixo,
            numero: Number(novoAnimal.numero),
            sexo: novoAnimal.sexo,
            paiId: novoAnimal.paiId || undefined,
            status: 'ATIVO'
          };

          const created = await createAnimal.mutateAsync(animalData) as any;
          animaisCriadosIds.push(created.id);

          if (novoAnimal.peso && Number(novoAnimal.peso) > 0) {
            await criarPesagem.mutateAsync({
              animalId: created.id,
              peso: Number(novoAnimal.peso),
              flag: 'ATIVO',
              observacao: 'Peso inicial'
            });
          }
        }
      }
      await createLote.mutateAsync({
        fazendaId,
        nome,
        prefixo: prefixo || undefined,
        capacidade: capacidade ? Number(capacidade) : undefined,
        animalIds: [...animaisSelecionados, ...animaisCriadosIds].length > 0
          ? [...animaisSelecionados, ...animaisCriadosIds]
          : undefined
      });
    } catch (error) {
      console.error('Erro ao criar lote:', error);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Criar Novo Lote</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Lote *</label>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
              placeholder="Ex: Lote A"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prefixo do Lote</label>
            <input
              value={prefixo}
              onChange={e => setPrefixo(e.target.value.toUpperCase())}
              placeholder="Ex: LA"
              maxLength={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Capacidade</label>
            <input
              type="number"
              value={capacidade}
              onChange={e => setCapacidade(e.target.value)}
              placeholder="Ex: 50"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-800">Criar Novos Animais</h4>
              <p className="text-sm text-gray-600">Adicione animais rapidamente ao lote</p>
            </div>
            <button
              type="button"
              onClick={adicionarNovoAnimal}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition font-semibold"
            >
              + Adicionar Animal
            </button>
          </div>

          {novosAnimais.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Prefixo Padrão para Novos Animais</label>
              <input
                value={prefixoPadrao}
                onChange={e => setPrefixoPadrao(e.target.value.toUpperCase())}
                placeholder="Ex: ERO"
                maxLength={4}
                className="w-full max-w-xs border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
          {novosAnimais.length > 0 && (
            <div className="space-y-3 mb-4">
              {novosAnimais.map((animal) => (
                <div key={animal.id} className="flex gap-3 items-end p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Número *</label>
                      <input
                        type="number"
                        value={animal.numero}
                        onChange={e => atualizarNovoAnimal(animal.id, 'numero', e.target.value)}
                        placeholder="123"
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Sexo</label>
                      <select
                        value={animal.sexo}
                        onChange={e => atualizarNovoAnimal(animal.id, 'sexo', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="MACHO">Macho</option>
                        <option value="FEMEA">Fêmea</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Peso Inicial (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={animal.peso}
                        onChange={e => atualizarNovoAnimal(animal.id, 'peso', e.target.value)}
                        placeholder="0.0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Pai</label>
                      <select
                        value={animal.paiId}
                        onChange={e => atualizarNovoAnimal(animal.id, 'paiId', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Nenhum / Desconhecido</option>
                        {pais?.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerNovoAnimal(animal.id)}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition font-semibold"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Animais Livres ({animais?.items?.length || 0})</h4>
          <p className="text-sm text-gray-600 mb-4">Selecione animais existentes para adicionar ao lote ({animaisSelecionados.length} selecionados)</p>
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {animais?.items?.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Nenhum animal disponível
              </div>
            )}
            <div className="divide-y divide-gray-200">
              {animais?.items?.map((animal: any) => (
                <label
                  key={animal.id}
                  className="flex items-center p-3 hover:bg-green-50 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={animaisSelecionados.includes(animal.id)}
                    onChange={() => toggleAnimal(animal.id)}
                    className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{animal.brinco}</div>
                    <div className="text-sm text-gray-600">
                      {animal.sexo} • {animal.lote?.nome || 'Sem lote'}
                      {animal.pesagens?.[0] && ` • ${animal.pesagens[0].peso}kg`}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={createLote.isPending || createAnimal.isPending}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg px-6 py-3 font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition"
          >
            {createLote.isPending || createAnimal.isPending ? 'Criando...' : 'Criar Lote'}
          </button>
        </div>
        {createLote.isSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-green-700 font-medium">✅ Lote criado com sucesso!</p>
          </div>
        )}
      </form>
    </div>
  );
}

function PaisTab({ fazendaId }: { fazendaId: string }) {
  const qc = useQueryClient();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const { data: pais = [] } = useQuery({
    queryKey: ['pais', fazendaId],
    queryFn: async () => {
      return apiFetch<any[]>(`/pais?fazendaId=${fazendaId}`);
    },
    enabled: !!fazendaId,
  });

  const createMutation = useMutation({
    mutationFn: async (body: { nome: string; descricao?: string }) => {
      await apiFetch('/pais', {
        method: 'POST',
        body: JSON.stringify({
          fazendaId,
          nome: body.nome,
          descricao: body.descricao || undefined,
        }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pais'] });
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
      qc.invalidateQueries({ queryKey: ['pais'] });
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
      qc.invalidateQueries({ queryKey: ['pais'] });
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

  const handleEditar = (pai: any) => {
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
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Gerenciar Pais</h3>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
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

      <div className="space-y-3">
        {pais.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum pai cadastrado ainda.</p>
        ) : (
          pais.map((pai: any) => (
            <div
              key={pai.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-800">{pai.nome}</h4>
                  {pai.descricao && (
                    <p className="text-gray-600 mt-1">{pai.descricao}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditar(pai)}
                    className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:border-blue-500 font-medium"
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
                    className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:border-red-500 disabled:opacity-50 font-medium"
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
  );
}

