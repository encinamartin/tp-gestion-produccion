import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Package, ClipboardList, CheckCircle } from 'lucide-react';

interface ExtendedUser {
  nombre?: string;
  name?: string;
  email?: string;
  rol?: string;
  role?: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const currentUser = user as ExtendedUser | null;

  const nombreUsuario = currentUser?.nombre || currentUser?.name || currentUser?.email || 'Usuario';
  const rolUsuario = currentUser?.rol || currentUser?.role || 'Sin rol';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">¡Hola, {nombreUsuario}! 👋</h1>
          <p className="text-gray-600">Bienvenido al sistema de gestión de producción.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <ClipboardList size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Rol Actual</p>
              <p className="text-xl font-bold text-gray-800 capitalize">{rolUsuario}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Estado Backend</p>
              <p className="text-xl font-bold text-green-600">Conectado</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <Package size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Módulos</p>
              <p className="text-xl font-bold text-gray-800">Órdenes / Stock</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}