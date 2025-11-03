import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '../components/NavBar';

type AnimalRow = {
  prefixo: string;
  numero: string;
  sexo: string;
  raca: string;
  peso: string;
  loteId: string;
};

export function CriarAnimaisEmLotePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: fazendas } = useQuery({ queryKey: ['fazendas'], queryFn: () => apiFetch<{ items: any[] }>('/fazendas') });
  const [fazendaId, setFazendaId] = useState('');
  useEffect(() => { if (fazendas?.items?.length && !fazendaId) setFazendaId(fazendas.items[0].id); }, [fazendas, fazendaId]);
  const { data: lotes } = useQuery({ queryKey: ['lotes', fazendaId], enabled: !!fazendaId, queryFn: () => apiFetch<{ items: any[] }>(`/lotes?fazendaId=${fazendaId}`) });

  const [rows, setRows] = useState<AnimalRow[]>([{ prefixo: 'ERO', numero: '1', sexo: 'MACHO', raca: '', peso: '', loteId: '' }]);
  const [prefixoPadrao, setPrefixoPadrao] = useState('ERO');
  const [numeroInicial, setNumeroInicial] = useState('1');

  const criarAnimal = useMutation({
    mutationFn: (body: any) => apiFetch('/animais', { method: 'POST', body: JSON.stringify(body) }),
  });

  const criarPesagem = useMutation({
    mutationFn: (data: any) => apiFetch('/pesagens', { method: 'POST', body: JSON.stringify(data) }),
  });

  const adicionarLinha = () => {
    const ultimoNumero = rows.length > 0 ? rows.map(r => Number(r.numero) || 0).filter(n => n > 0).sort((a, b) => b - a)[0] || Number(numeroInicial) - 1 : Number(numeroInicial) - 1;
    setRows([...rows, { prefixo: prefixoPadrao, numero: String(ultimoNumero + 1), sexo: 'MACHO', raca: '', peso: '', loteId: '' }]);
  };

  useEffect(() => {
    if (rows.length === 1 && numeroInicial && rows[0].numero !== numeroInicial) {
      setRows([{ prefixo: prefixoPadrao, numero: numeroInicial, sexo: 'MACHO', raca: '', peso: '', loteId: '' }]);
    }
  }, [numeroInicial, prefixoPadrao]); // eslint-disable-line

  const removerLinha = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const atualizarLinha = (index: number, campo: keyof AnimalRow, valor: string) => {
    const novas = [...rows];
    novas[index] = { ...novas[index], [campo]: valor };
    setRows(novas);
  };

  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<string[]>([]);

  const salvarTodos = async () => {
    setSalvando(true);
    setErros([]);
    const errosLocal: string[] = [];
    
    for (const row of rows) {
      if (!row.prefixo || !row.numero) continue;
      try {
        const prefixoFinal = (row.prefixo || prefixoPadrao).toUpperCase();
        const numeroFinal = Number(row.numero);
        if (!prefixoFinal || !numeroFinal || numeroFinal < 1 || numeroFinal > 10000) {
          errosLocal.push(`Linha ${rows.indexOf(row) + 1}: Prefixo ou número inválido`);
          continue;
        }
        
        const animal = await criarAnimal.mutateAsync({
          fazendaId,
          prefixo: prefixoFinal,
          numero: numeroFinal,
          sexo: row.sexo || 'MACHO',
          raca: row.raca || undefined,
          loteId: row.loteId || undefined,
        });
        
        if (row.peso && Number(row.peso) > 0) {
          try {
            await criarPesagem.mutateAsync({ animalId: animal.id, peso: Number(row.peso), flag: 'ATIVO', observacao: 'Peso inicial' });
          } catch (e: any) {
            errosLocal.push(`Erro ao criar pesagem para ${animal.brinco}: ${e?.error?.message || 'Erro desconhecido'}`);
          }
        }
      } catch (e: any) {
        const brinco = `${row.prefixo || prefixoPadrao}-${row.numero}`;
        errosLocal.push(`Erro ao criar ${brinco}: ${e?.error?.message || 'Erro desconhecido'}`);
      }
    }
    
    setErros(errosLocal);
    setSalvando(false);
    
    const criados = rows.filter(r => r.prefixo && r.numero).length - errosLocal.length;
    if (criados > 0) {
      qc.invalidateQueries({ queryKey: ['animais'] });
      qc.invalidateQueries({ queryKey: ['pesagens'] });
      qc.refetchQueries({ queryKey: ['animais'] });
      alert(`✅ ${criados} animal(is) criado(s) com sucesso!${errosLocal.length > 0 ? `\n⚠️ ${errosLocal.length} erro(s) encontrado(s).` : ''}`);
      setTimeout(() => navigate('/animais'), 1000);
    } else if (errosLocal.length > 0) {
      alert(`❌ Não foi possível criar os animais. Verifique os erros abaixo.`);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <NavBar />
      <h2 className="text-2xl font-bold mb-6">Criar Animais em Lote</h2>

      <div className="bg-white shadow rounded-xl p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fazenda</label>
            <select value={fazendaId} onChange={e => setFazendaId(e.target.value)} className="w-full border rounded-lg px-3 py-2">
              {fazendas?.items?.map((f: any) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prefixo Padrão</label>
            <input value={prefixoPadrao} onChange={e => setPrefixoPadrao(e.target.value.toUpperCase())} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Número Inicial</label>
            <input type="number" value={numeroInicial} onChange={e => setNumeroInicial(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={adicionarLinha} className="bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700">+ Adicionar Linha</button>
          <button onClick={salvarTodos} disabled={salvando} className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">
            {salvando ? 'Salvando...' : 'Salvar Todos'}
          </button>
        </div>
        {erros.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="font-medium text-red-800 mb-2">Erros encontrados:</div>
            <ul className="list-disc ml-5 text-sm text-red-700">
              {erros.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2">Prefixo</th>
                <th className="px-3 py-2">Número</th>
                <th className="px-3 py-2">Sexo</th>
                <th className="px-3 py-2">Raça</th>
                <th className="px-3 py-2">Peso (kg)</th>
                <th className="px-3 py-2">Lote</th>
                <th className="px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-t">
                  <td className="px-3 py-2">
                    <input value={row.prefixo || prefixoPadrao} onChange={e => atualizarLinha(index, 'prefixo', e.target.value.toUpperCase())} className="w-full border rounded px-2 py-1" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" value={row.numero} onChange={e => atualizarLinha(index, 'numero', e.target.value)} placeholder={index === 0 ? numeroInicial : ''} className="w-full border rounded px-2 py-1" />
                  </td>
                  <td className="px-3 py-2">
                    <select value={row.sexo} onChange={e => atualizarLinha(index, 'sexo', e.target.value)} className="w-full border rounded px-2 py-1">
                      <option>MACHO</option>
                      <option>FEMEA</option>
                      <option>DESCONHECIDO</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input value={row.raca} onChange={e => atualizarLinha(index, 'raca', e.target.value)} className="w-full border rounded px-2 py-1" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" step="0.1" value={row.peso} onChange={e => atualizarLinha(index, 'peso', e.target.value)} className="w-full border rounded px-2 py-1" />
                  </td>
                  <td className="px-3 py-2">
                    <select value={row.loteId} onChange={e => atualizarLinha(index, 'loteId', e.target.value)} className="w-full border rounded px-2 py-1">
                      <option value="">Nenhum</option>
                      {lotes?.items?.map((l: any) => <option key={l.id} value={l.id}>{l.nome}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => removerLinha(index)} className="text-red-600 hover:underline">Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

