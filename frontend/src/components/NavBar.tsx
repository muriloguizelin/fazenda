import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';

export function NavBar() {
  const location = useLocation();
  const logout = useAuthStore(s => s.clear);
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  if (isDashboard) return null;

  return (
    <nav className="bg-white shadow-md rounded-xl mb-6 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition font-medium group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🏠</span>
          <span className="text-lg">Dashboard</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/animais"
            className="text-gray-600 hover:text-green-600 transition font-medium"
          >
            🐄 Animais
          </Link>
          <Link
            to="/lotes"
            className="text-gray-600 hover:text-green-600 transition font-medium"
          >
            📦 Lotes
          </Link>
          <Link
            to="/financeiro"
            className="text-gray-600 hover:text-green-600 transition font-medium"
          >
            💰 Financeiro
          </Link>
          <button
            onClick={logout}
            className="text-red-600 hover:text-red-700 transition font-medium"
          >
            🚪 Sair
          </button>
        </div>
      </div>
    </nav>
  );
}

