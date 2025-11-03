import { Link } from 'react-router-dom';

export function NavBar() {
  return (
    <div className="mb-4">
      <Link to="/" className="text-blue-600 hover:underline">🏠 Home</Link>
    </div>
  );
}

