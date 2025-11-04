import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar } from '../components/NavBar';

export function EditarAnimalPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: animal } = useQuery({ queryKey: ['animal', id], enabled: !!id, queryFn: () => apiFetch<any>(`/animais/${id}`) });
  const { data: fazendas } = useQuery({ queryKey: ['fazendas'], queryFn: () => apiFetch<{ items: any[] }>('/fazendas') });
  const { data: lotes } = useQuery({ queryKey: ['lotes', animal?.fazendaId], enabled: !!animal?.fazendaId, queryFn: () => apiFetch<{ items: any[] }>(`/lotes?fazendaId=${animal?.fazendaId || ''}`) });

  const [sexo, setSexo] = useState('');
  const [raca, setRaca] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [origem, setOrigem] = useState('');
  const [loteId, setLoteId] = useState('');
  const [peso, setPeso] = useState(''); // Novo campo para peso

  useEffect(() => {
    if (animal) {
      setSexo(animal.sexo || 'MACHO');
      setRaca(animal.raca || 'NELORE');
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

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <NavBar />
      <h2 className="text-2xl font-bold mb-6">Editar Animal {animal?.brinco}</h2>
      
      <div className="bg-white shadow rounded-xl p-6">
        <form onSubmit={(e) => { 
          e.preventDefault(); 
          const updateData: any = { sexo, raca, nascimento: nascimento || undefined, origem: origem || undefined, loteId: loteId || undefined };
          if (peso && Number(peso) > 0) updateData.peso = Number(peso);
          updateAnimal.mutate(updateData); 
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sexo</label>
              <select value={sexo} onChange={e => setSexo(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option>MACHO</option>
                <option>FEMEA</option>
                <option>DESCONHECIDO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Raça</label>
              <select value={raca} onChange={e => setRaca(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option value="NELORE">Nelore</option>
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
              <label className="block text-sm font-medium mb-1">Peso Atual (kg)</label>
              <input 
                type="number" 
                step="0.1" 
                value={peso} 
                onChange={e => setPeso(e.target.value)} 
                placeholder="Ex: 450.5" 
                className="w-full border rounded-lg px-3 py-2" 
              />
              <small className="text-gray-500">Deixe vazio para não alterar</small>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={updateAnimal.isPending} className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition">
              {updateAnimal.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button type="button" onClick={() => navigate(`/animal/${id}`)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

