import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = { id: string; nome: string; email: string; cargo: string; contaId: string };

interface AuthState {
  accessToken: string | null;
  user: User | null;
  fazendaSelecionada: string | null;
  setAuth: (accessToken: string, user: User) => void;
  setFazenda: (fazendaId: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      fazendaSelecionada: null,
      setAuth: (accessToken, user) => set({ accessToken, user }),
      setFazenda: (fazendaId) => set({ fazendaSelecionada: fazendaId }),
      clear: () => set({ accessToken: null, user: null, fazendaSelecionada: null })
    }),
    {
      name: 'auth-storage',
    }
  )
);


