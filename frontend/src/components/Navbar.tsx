import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, ClipboardList, LayoutDashboard, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <span className="font-bold text-lg text-blue-400">PymeControl</span>
            
            <div className="flex space-x-4">
              <Link to="/" className="flex items-center space-x-1 hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              
              <Link to="/orders" className="flex items-center space-x-1 hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium">
                <ClipboardList size={18} />
                <span>Órdenes</span>
              </Link>

              <Link to="/inventory" className="flex items-center space-x-1 hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium">
                <Package size={18} />
                <span>Inventario</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <User size={16} />
              <span>{user?.nombre}</span>
              <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full capitalize">
                {user?.rol}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md text-sm font-medium transition"
            >
              <LogOut size={16} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}