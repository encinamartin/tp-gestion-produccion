// ==========================================
// 1. IMPORTACIONES DE COMPONENTES Y LIBRERÍAS
// ==========================================
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  ClipboardList,
  Clock,
  AlertTriangle,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

// Interfaces tipadas para datos del dashboard
interface ExtendedUser {
  nombre?: string;
  name?: string;
  email?: string;
  rol?: string;
  role?: string;
}

interface ProductItem {
  _id: string;
  nombre: string;
  stock: number;
  stockMinimo?: number;
}

interface OrderItem {
  _id: string;
  estado: 'pendiente' | 'en_proceso' | 'terminada' | 'cancelada';
}

// ==========================================
// 2. COMPONENTE PRINCIPAL (DASHBOARD)
// ==========================================
export default function Dashboard() {
  const { user } = useAuth();
  const currentUser = user as ExtendedUser | null;

  // Formateo de datos de usuario
  const nombreUsuario =
    currentUser?.nombre || currentUser?.name || currentUser?.email || 'Usuario';
  const rolUsuario = currentUser?.rol || currentUser?.role || 'Sin rol';

  // Estados para métricas en tiempo real
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [inProgressOrders, setInProgressOrders] = useState(0);

  // ==========================================
  // 3. CONSULTA DE MÉTRICAS A LA API
  // ==========================================
  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      // Consultas en paralelo para optimizar la carga
      const [productsRes, ordersRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders'),
      ]);

      const products: ProductItem[] = productsRes.data;
      const orders: OrderItem[] = ordersRes.data;

      // Cálculo de métricas de Inventario
      setTotalProducts(products.length);
      const lowStock = products.filter(
        (p) => p.stockMinimo !== undefined && p.stock <= p.stockMinimo
      ).length;
      setLowStockCount(lowStock);

      // Cálculo de métricas de Órdenes de Producción
      setPendingOrders(orders.filter((o) => o.estado === 'pendiente').length);
      setInProgressOrders(orders.filter((o) => o.estado === 'en_proceso').length);
    } catch {
      // Manejo silencioso de errores en carga de métricas
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial al montar el componente
  useEffect(() => {
    const loadData = async () => {
      await fetchDashboardMetrics();
    };
    void loadData();
  }, []);

  // ==========================================
  // 4. RENDERIZADO DE LA INTERFAZ (UI)
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado y Bienvenida */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ¡Hola, {nombreUsuario}! 👋
            </h1>
            <p className="text-gray-600">
              Panel de control e indicadores operativos en tiempo real.
            </p>
          </div>
          <button
            onClick={() => void fetchDashboardMetrics()}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Tarjetas de Métricas e Indicadores (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Métric 1: Órdenes en Proceso */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">En Fabricación</p>
              <p className="text-2xl font-bold text-gray-800">
                {loading ? '...' : `${inProgressOrders} órdenes`}
              </p>
            </div>
          </div>

          {/* Métrica 2: Órdenes Pendientes */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <ClipboardList size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Por Iniciar</p>
              <p className="text-2xl font-bold text-gray-800">
                {loading ? '...' : `${pendingOrders} órdenes`}
              </p>
            </div>
          </div>

          {/* Métrica 3: Alertas de Stock Bajo */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <AlertTriangle size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Stock Crítico</p>
              <p
                className={`text-2xl font-bold ${
                  lowStockCount > 0 ? 'text-red-600' : 'text-gray-800'
                }`}
              >
                {loading ? '...' : `${lowStockCount} ítems`}
              </p>
            </div>
          </div>

          {/* Métrica 4: Total Productos/Insumos */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <Package size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Catálogo Ítems</p>
              <p className="text-2xl font-bold text-gray-800">
                {loading ? '...' : `${totalProducts} registrados`}
              </p>
            </div>
          </div>
        </div>

        {/* Bloque Informativo de Sesión */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <UserCheck size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Perfil Activo</p>
              <p className="text-lg font-bold text-gray-800 capitalize">
                Rol: <span className="text-purple-600">{rolUsuario}</span>
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            ● Sistema Conectado
          </span>
        </div>
      </main>
    </div>
  );
}