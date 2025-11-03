import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnimaisPage } from './pages/AnimaisPage';
import { LotesPage } from './pages/LotesPage';
import { AnimalDetailPage } from './pages/AnimalDetailPage';
import { CriarLotePage } from './pages/CriarLotePage';
import { CriarAnimalPage } from './pages/CriarAnimalPage';
import { IniciarPesagemPage } from './pages/IniciarPesagemPage';
import { CriarAnimaisEmLotePage } from './pages/CriarAnimaisEmLotePage';
import { EditarAnimalPage } from './pages/EditarAnimalPage';
import 'leaflet/dist/leaflet.css';
import './index.css';

const queryClient = new QueryClient();

function AppRoutes() {
  const token = useAuthStore(s => s.accessToken);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={token ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/animais" element={token ? <AnimaisPage /> : <Navigate to="/login" />} />
        <Route path="/lotes" element={token ? <LotesPage /> : <Navigate to="/login" />} />
        <Route path="/criar-lote" element={token ? <CriarLotePage /> : <Navigate to="/login" />} />
        <Route path="/criar-animal" element={token ? <CriarAnimalPage /> : <Navigate to="/login" />} />
        <Route path="/criar-animais-lote" element={token ? <CriarAnimaisEmLotePage /> : <Navigate to="/login" />} />
        <Route path="/editar-animal/:id" element={token ? <EditarAnimalPage /> : <Navigate to="/login" />} />
        <Route path="/iniciar-pesagem" element={token ? <IniciarPesagemPage /> : <Navigate to="/login" />} />
        <Route path="/animal/:id" element={token ? <AnimalDetailPage /> : <Navigate to="/login" />} />
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


