import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnimaisPage } from './pages/AnimaisPage';
import { PaisPage } from './pages/PaisPage';
import { LotesPage } from './pages/LotesPage';
import { AnimalDetailPage } from './pages/AnimalDetailPage';
import { IniciarPesagemPage } from './pages/IniciarPesagemPage';
import { EditarAnimalPage } from './pages/EditarAnimalPage';
import SelecionarFazendaPage from './pages/SelecionarFazendaPage';
import CriarFazendaPage from './pages/CriarFazendaPage';
import 'leaflet/dist/leaflet.css';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      staleTime: Infinity,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.accessToken);
  const fazenda = useAuthStore(s => s.fazendaSelecionada);
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (!fazenda) {
    return <Navigate to="/selecionar-fazenda" />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const token = useAuthStore(s => s.accessToken);
  const fazenda = useAuthStore(s => s.fazendaSelecionada);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/selecionar-fazenda" element={token ? <SelecionarFazendaPage /> : <Navigate to="/login" />} />
        <Route path="/criar-fazenda" element={token ? <CriarFazendaPage /> : <Navigate to="/login" />} />
        <Route path="/" element={token ? (fazenda ? <Navigate to="/dashboard" /> : <Navigate to="/selecionar-fazenda" />) : <Navigate to="/login" />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/animais" element={<ProtectedRoute><AnimaisPage /></ProtectedRoute>} />
        <Route path="/pais" element={<ProtectedRoute><PaisPage /></ProtectedRoute>} />
        <Route path="/lotes" element={<ProtectedRoute><LotesPage /></ProtectedRoute>} />
        <Route path="/editar-animal/:id" element={<ProtectedRoute><EditarAnimalPage /></ProtectedRoute>} />
        <Route path="/iniciar-pesagem" element={<ProtectedRoute><IniciarPesagemPage /></ProtectedRoute>} />
        <Route path="/animal/:id" element={<ProtectedRoute><AnimalDetailPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  </React.StrictMode>
);


