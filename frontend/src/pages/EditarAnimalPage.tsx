import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { useAuthStore } from '../stores/auth';

export function EditarAnimalPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fazendaId = useAuthStore(s => s.fazendaSelecionada);
  const { data: animal } = useQuery({ queryKey: ['animal', id], enabled: !!id, queryFn: () => apiFetch<any>(`/animais/${id}`) });
  const { data: lotes } = useQuery({ queryKey: ['lotes', fazendaId], enabled: !!fazendaId, queryFn: () => apiFetch<{ items: any[] }>(`/lotes?fazendaId=${fazendaId || ''}`) });
  const { data: pais } = useQuery({ queryKey: ['pais', fazendaId], enabled: !!fazendaId, queryFn: () => apiFetch<any[]>(`/pais?fazendaId=${fazendaId}`) });

  const [sexo, setSexo] = useState('');
  const [paiId, setPaiId] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [origem, setOrigem] = useState('');
  const [loteId, setLoteId] = useState('');
  const [status, setStatus] = useState('ATIVO');
  const [peso, setPeso] = useState('');
  const [observacao, setObservacao] = useState('');
  const [adicionarPesagem, setAdicionarPesagem] = useState(false);

  useEffect(() => {
    if (animal) {
      setSexo(animal.sexo || 'MACHO');
      setPaiId(animal.paiId || '');
      setStatus(animal.status || 'ATIVO');
      setNascimento(animal.nascimento ? new Date(animal.nascimento).toISOString().split('T')[0] : '');
      setOrigem(animal.origem || '');
      setLoteId(animal.loteId || '');
      // Peso atual (do último registro de pesagem)
      setPeso(animal.pesagens?.[0]?.peso?.toString() || '');
    }
  }, [animal]);

  const updateAnimal = useMutation({
    mutationFn: (body: any) => apiFetch(`/animais/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['animal', 'animais'] }); navigate(`/animal/${id}`); }
  });

  const criarPesagem = useMutation({
    mutationFn: (data: any) => apiFetch('/pesagens', { method: 'POST', body: JSON.stringify(data) }),
  });

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <NavBar />
      <h2 className="text-2xl font-bold mb-6">Editar Animal {animal?.brinco}</h2>
      
      <div className="bg-white shadow rounded-xl p-6">
        <form onSubmit={async (e) => { 
          e.preventDefault(); 
          const updateData: any = { 
            sexo, 
            paiId: paiId || undefined, 
            status,
            nascimento: nascimento || undefined, 
            origem: origem || undefined, 
            loteId: loteId || undefined 
          };
          
          // Se marcou para adicionar pesagem, inclui peso e observação na atualização
          if (adicionarPesagem && peso && Number(peso) > 0) {
            updateData.peso = Number(peso);
            updateData.observacao = observacao || undefined;
          }
          
          await updateAnimal.mutateAsync(updateData);
          qc.invalidateQueries({ queryKey: ['animal', 'animais', 'pesagens'] });
          navigate(`/animal/${id}`);
        }} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-700">
              <strong>Animal:</strong> {animal?.brinco} | 
              <strong> Peso atual:</strong> {animal?.pesagens?.[0]?.peso || 'Não informado'} kg
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sexo</label>
              <select value={sexo} onChange={e => setSexo(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option>MACHO</option>
                <option>FEMEA</option>
                <option>DESCONHECIDO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pai</label>
              <select value={paiId} onChange={e => setPaiId(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option value="">Nenhum / Desconhecido</option>
                {pais?.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option value="ATIVO">Ativo</option>
                <option value="MORTO">Morto</option>
                <option value="VENDIDO">Vendido</option>
                <option value="DOENTE">Doente</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
              <input type="date" value={nascimento} onChange={e => setNascimento(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Origem</label>
              <input value={origem} onChange={e => setOrigem(e.target.value)} placeholder="Compra, Nascido" className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Lote</label>
              <select value={loteId} onChange={e => setLoteId(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option value="">Nenhum</option>
                {lotes?.items?.map((l: any) => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                <input 
                  type="checkbox" 
                  checked={adicionarPesagem}
                  onChange={e => setAdicionarPesagem(e.target.checked)}
                  className="mr-2"
                />
                Adicionar nova pesagem
              </label>
            </div>
          </div>
          
          {adicionarPesagem && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Nova Pesagem</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Peso (kg)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={peso} 
                    onChange={e => setPeso(e.target.value)} 
                    placeholder="Novo peso (kg)" 
                    className="w-full border rounded-lg px-3 py-2" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data da Pesagem</label>
                  <input
                    type="date"
                    value={new Date().toISOString().split('T')[0]}
                    className="w-full border rounded-lg px-3 py-2"
                    readOnly
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Observações</label>
                <textarea
                  value={observacao}
                  onChange={e => setObservacao(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Digite observações sobre o animal ou a pesagem"
                />
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={updateAnimal.isPending || criarPesagem.isPending} className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition">
              {(updateAnimal.isPending || criarPesagem.isPending) ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button type="button" onClick={() => navigate(`/animal/${id}`)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}


