// ==========================================
// 1. IMPORTACIONES DE COMPONENTES Y LIBRERÍAS
// ==========================================
import { useState, useEffect, type FormEvent } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckCircle, Clock, AlertCircle, RefreshCw, Calendar } from 'lucide-react';

// Interfaces tipadas
interface Product {
  _id: string;
  nombre: string;
  codigo: string;
  tipo: 'insumo' | 'producto_terminado';
}

interface Order {
  _id: string;
  producto?: {
    _id: string;
    nombre: string;
    codigo: string;
  } | null;
  productoId?: {
    _id: string;
    nombre: string;
    codigo: string;
  } | null;
  cantidad: number;
  estado: 'pendiente' | 'en_proceso' | 'terminada' | 'cancelada';
  fechaEntregaComprometida: string;
  createdAt: string;
}

// ==========================================
// 2. COMPONENTE PRINCIPAL (ORDERS)
// ==========================================
export default function Orders() {
  // Estados para datos principales
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para el formulario de creación (Rol Planificador)
  const [selectedProduct, setSelectedProduct] = useState('');
  const [cantidad, setCantidad] = useState<number | string>(1);
  const [fechaEntrega, setFechaEntrega] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();

  // ==========================================
  // 3. LLAMADAS A LA API
  // ==========================================
  // Obtiene el listado completo de órdenes de producción
  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch {
      setError('Error al cargar las órdenes de producción');
    } finally {
      setLoading(false);
    }
  };

  // Obtiene los productos terminados para popular la lista desplegable
  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      // Filtramos únicamente los productos terminados aptos para fabricación
      const finishedProducts = response.data.filter(
        (p: Product) => p.tipo === 'producto_terminado'
      );
      setProducts(finishedProducts);
      if (finishedProducts.length > 0) {
        setSelectedProduct(finishedProducts[0]._id);
      }
    } catch {
      // Manejo silencioso de error en carga de productos
    }
  };

  // Carga inicial de datos al montar el componente
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchOrders(), fetchProducts()]);
    };
    void loadInitialData();
  }, []);

  // ==========================================
  // 4. MANEJADORES DE EVENTOS (HANDLERS)
  // ==========================================
  // Envío del formulario para crear una nueva orden de producción
  const handleCreateOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert('Debe seleccionar un producto terminado válido');
      return;
    }

    const cantidadNum = Number(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      alert('La cantidad debe ser un número mayor a 0');
      return;
    }

    if (!fechaEntrega) {
      alert('Debe seleccionar una fecha de entrega comprometida');
      return;
    }

    setIsSubmitting(true);
    try {
      // Enviamos producto, cantidad y fechaEntregaComprometida requeridos
      await api.post('/orders', {
        producto: selectedProduct,
        productoId: selectedProduct,
        cantidad: cantidadNum,
        fechaEntregaComprometida: fechaEntrega,
      });
      setCantidad(1);
      await fetchOrders();
    } catch (err: unknown) {
      const errorMsg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Error al crear la orden de producción';
      alert(errorMsg || 'Error al crear la orden de producción');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cambio de estado en el ciclo de vida de la orden
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { estado: newStatus });
      await fetchOrders();
    } catch (err: unknown) {
      const errorMsg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Error al actualizar estado de la orden';
      alert(errorMsg || 'Error al actualizar estado de la orden');
    }
  };

  // ==========================================
  // 5. RENDERIZADO DE LA INTERFAZ (UI)
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Órdenes de Producción</h1>
            <p className="text-gray-600">Monitoreo y ejecución de flujos de fabricación</p>
          </div>
          <button
            onClick={() => void fetchOrders()}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium"
          >
            <RefreshCw size={18} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Panel para creación de órdenes (Restringido a Planificador) */}
        {user?.rol === 'planificador' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-blue-600" /> Nueva Orden de Producción
            </h2>
            <form onSubmit={(e) => void handleCreateOrder(e)} className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {products.length === 0 ? (
                  <option value="">No hay productos terminados creados</option>
                ) : (
                  products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.nombre} ({p.codigo})
                    </option>
                  ))
                )}
              </select>

              <input
                type="number"
                min="1"
                required
                className="w-full sm:w-28 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="Cantidad"
              />

              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-blue-500">
                <Calendar size={18} className="text-gray-400" />
                <input
                  type="date"
                  required
                  className="outline-none text-sm text-gray-700 bg-transparent"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || products.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition disabled:opacity-50 whitespace-nowrap"
              >
                {isSubmitting ? 'Guardando...' : 'Emitir Orden'}
              </button>
            </form>
          </div>
        )}

        {/* Listado / Tabla de Órdenes */}
        {loading ? (
          <p className="text-gray-500">Cargando órdenes...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                  <th className="p-4">Producto</th>
                  <th className="p-4">Cantidad</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Fecha Emisión</th>
                  <th className="p-4">Fecha Límite</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      No hay órdenes de producción registradas.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const prod = order.producto || order.productoId;
                    return (
                      <tr key={order._id} className="hover:bg-gray-50/50">
                        <td className="p-4 font-medium text-gray-800">
                          {prod?.nombre || 'Producto no especificado'}
                          {prod?.codigo && (
                            <span className="block text-xs text-gray-400 font-mono">
                              {prod.codigo}
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-semibold text-gray-700">{order.cantidad} u.</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                              order.estado === 'terminada'
                                ? 'bg-green-100 text-green-700'
                                : order.estado === 'en_proceso'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {order.estado === 'terminada' && <CheckCircle size={14} />}
                            {order.estado === 'en_proceso' && <Clock size={14} />}
                            {order.estado === 'pendiente' && <AlertCircle size={14} />}
                            {order.estado.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-gray-500 font-medium">
                          {order.fechaEntregaComprometida
                            ? new Date(order.fechaEntregaComprometida).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="p-4 text-right">
                          {order.estado !== 'terminada' && (
                            <div className="inline-flex gap-2">
                              {order.estado === 'pendiente' && (
                                <button
                                  onClick={() => void handleStatusChange(order._id, 'en_proceso')}
                                  className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs font-medium transition"
                                >
                                  Iniciar (Consumir Insumos)
                                </button>
                              )}
                              {order.estado === 'en_proceso' && (
                                <button
                                  onClick={() => void handleStatusChange(order._id, 'terminada')}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition"
                                >
                                  Finalizar (Ingresar Stock)
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}