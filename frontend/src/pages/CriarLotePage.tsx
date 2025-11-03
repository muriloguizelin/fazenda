import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '../components/NavBar';

export function CriarLotePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: fazendas } = useQuery({ queryKey: ['fazendas'], queryFn: () => apiFetch<{ items: any[] }>('/fazendas') });
  const [fazendaId, setFazendaId] = useState('');
  useEffect(() => { if (fazendas?.items?.length && !fazendaId) setFazendaId(fazendas.items[0].id); }, [fazendas, fazendaId]);

  const createLote = useMutation({
    mutationFn: (body: any) => apiFetch('/lotes', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lotes'] }); navigate('/lotes'); }
  });

  const [nome, setNome] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [area, setArea] = useState('');

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <NavBar />
      <h2 className="text-2xl font-bold mb-6">Criar Lote</h2>
      
      <div className="bg-white shadow rounded-xl p-6">
        <form onSubmit={(e) => { e.preventDefault(); createLote.mutate({ fazendaId, nome, capacidade: capacidade ? Number(capacidade) : undefined, area: area ? Number(area) : undefined }); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fazenda</label>
            <select value={fazendaId} onChange={e => setFazendaId(e.target.value)} className="w-full border rounded-lg px-3 py-2">
              {fazendas?.items?.map((f: any) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Lote</label>
            <input value={nome} onChange={e => setNome(e.target.value)} required placeholder="Ex: Lote 1" className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Capacidade</label>
              <input type="number" value={capacidade} onChange={e => setCapacidade(e.target.value)} placeholder="Ex: 100" className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Área (hectares)</label>
              <input type="number" step="0.1" value={area} onChange={e => setArea(e.target.value)} placeholder="Ex: 10.5" className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={createLote.isPending} className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition">
              {createLote.isPending ? 'Criando...' : 'Criar Lote'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

