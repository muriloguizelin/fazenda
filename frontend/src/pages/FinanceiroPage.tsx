import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { NavBar } from '../components/NavBar';
import { useAuthStore } from '../stores/auth';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CATEGORIAS = ['PESSOAL', 'COMBUSTIVEL', 'RACAO', 'MANUTENCAO', 'MEDICAMENTOS', 'OUTROS'];

export function FinanceiroPage() {
    const fazendaId = useAuthStore(s => s.fazendaSelecionada);
    const qc = useQueryClient();
    const [activeTab, setActiveTab] = useState<'visao-geral' | 'lancamentos'>('visao-geral');
    const [showModal, setShowModal] = useState(false);

    // Filtros
    const [periodo, setPeriodo] = useState('30d'); // 30d, 90d, 1y

    // Queries
    const { data: metrics } = useQuery({
        queryKey: ['financeiro-metrics', fazendaId, periodo],
        enabled: !!fazendaId,
        queryFn: () => apiFetch<any>(`/despesas/metrics?fazendaId=${fazendaId}&period=${periodo}`)
    });

    const { data: despesas } = useQuery({
        queryKey: ['despesas', fazendaId],
        enabled: !!fazendaId,
        queryFn: () => apiFetch<any[]>(`/despesas?fazendaId=${fazendaId}`)
    });

    // Mutation
    const createDespesa = useMutation({
        mutationFn: (data: any) => apiFetch('/despesas', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['despesas'] });
            qc.invalidateQueries({ queryKey: ['financeiro-metrics'] });
            setShowModal(false);
        }
    });

    const deleteDespesa = useMutation({
        mutationFn: (id: string) => apiFetch(`/despesas/${id}`, { method: 'DELETE' }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['despesas'] });
            qc.invalidateQueries({ queryKey: ['financeiro-metrics'] });
        }
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <NavBar />

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">💰 Controle Financeiro</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-lg flex items-center gap-2"
                    >
                        + Nova Despesa
                    </button>
                </div>

                {/* Abas */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('visao-geral')}
                        className={`pb-2 px-4 font-medium ${activeTab === 'visao-geral' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Visão Geral
                    </button>
                    <button
                        onClick={() => setActiveTab('lancamentos')}
                        className={`pb-2 px-4 font-medium ${activeTab === 'lancamentos' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Lançamentos
                    </button>
                </div>

                {activeTab === 'visao-geral' && (
                    <div className="space-y-6">
                        {/* Cards de Resumo */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-gray-500 text-sm font-medium">Gasto Total ({periodo})</h3>
                                <p className="text-3xl font-bold text-gray-800 mt-2">
                                    R$ {metrics?.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-gray-500 text-sm font-medium">Período</h3>
                                    <select
                                        value={periodo}
                                        onChange={e => setPeriodo(e.target.value)}
                                        className="mt-2 border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200"
                                    >
                                        <option value="30d">Últimos 30 dias</option>
                                        <option value="90d">Últimos 90 dias</option>
                                        <option value="1y">Último ano</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Gráficos */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Gráfico de Pizza - Categorias */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                                <h3 className="text-lg font-semibold mb-4">Gastos por Categoria</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={metrics?.byCategory || []}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {metrics?.byCategory?.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Gráfico de Barras - Evolução Mensal */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                                <h3 className="text-lg font-semibold mb-4">Evolução Mensal</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={metrics?.monthlyChart || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                                        <Bar dataKey="value" fill="#10B981" name="Gasto" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'lancamentos' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {despesas?.map((d: any) => (
                                    <tr key={d.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(d.data).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{d.descricao}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {d.categoria}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            R$ {d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button
                                                onClick={() => { if (confirm('Tem certeza?')) deleteDespesa.mutate(d.id) }}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {despesas?.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            Nenhuma despesa encontrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal Nova Despesa */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <h2 className="text-xl font-bold mb-4">Nova Despesa</h2>
                            <NovaDespesaForm
                                onClose={() => setShowModal(false)}
                                onSubmit={(data) => createDespesa.mutate({ ...data, fazendaId })}
                                isLoading={createDespesa.isPending}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function NovaDespesaForm({ onClose, onSubmit, isLoading }: any) {
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [categoria, setCategoria] = useState('OUTROS');
    const [data, setData] = useState(new Date().toISOString().split('T')[0]);
    const [observacao, setObservacao] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            descricao,
            valor: Number(valor),
            categoria,
            data,
            observacao
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <input
                    required
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    className="mt-1 w-full border rounded-md p-2"
                    placeholder="Ex: Ração Gado Corte"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                <input
                    required
                    type="number"
                    step="0.01"
                    value={valor}
                    onChange={e => setValor(e.target.value)}
                    className="mt-1 w-full border rounded-md p-2"
                    placeholder="0,00"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Categoria</label>
                <select
                    value={categoria}
                    onChange={e => setCategoria(e.target.value)}
                    className="mt-1 w-full border rounded-md p-2"
                >
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Data</label>
                <input
                    type="date"
                    required
                    value={data}
                    onChange={e => setData(e.target.value)}
                    className="mt-1 w-full border rounded-md p-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Observação</label>
                <textarea
                    value={observacao}
                    onChange={e => setObservacao(e.target.value)}
                    className="mt-1 w-full border rounded-md p-2"
                    rows={3}
                />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                    {isLoading ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </form>
    );
}
