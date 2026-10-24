import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Order {
  _id: string;
  producto: string;
  cantidad: number;
  estado: 'pendiente' | 'en_proceso' | 'terminada' | 'cancelada';
  createdAt: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Formulario para nueva orden (Planificador)
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (err: any) {
      setError('Error al cargar las órdenes de producción');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/orders', { producto, cantidad });
      setProducto('');
      setCantidad(1);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear la orden');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { estado: newStatus });
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar estado');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Órdenes de Producción</h1>
            <p className="text-gray-600">Monitoreo y ejecución de flujos de fabricación</p>
          </div>
        </div>

        {user?.rol === 'planificador' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-blue-600" /> Nueva Orden de Producción
            </h2>
            <form onSubmit={handleCreateOrder} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Nombre del Producto"
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
              />
              <input
                type="number"
                min="1"
                required
                className="w-full sm:w-32 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition disabled:opacity-50"
              >
                Crear Orden
              </button>
            </form>
          </div>
        )}

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
                  <th className="p-4">Fecha</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-800">{order.producto}</td>
                    <td className="p-4">{order.cantidad} u.</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        order.estado === 'terminada' ? 'bg-green-100 text-green-700' :
                        order.estado === 'en_proceso' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.estado === 'terminada' && <CheckCircle size={12} />}
                        {order.estado === 'en_proceso' && <Clock size={12} />}
                        {order.estado === 'pendiente' && <AlertCircle size={12} />}
                        {order.estado}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {order.estado !== 'terminada' && (
                        <div className="inline-flex gap-2">
                          {order.estado === 'pendiente' && (
                            <button
                              onClick={() => handleStatusChange(order._id, 'en_proceso')}
                              className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs font-medium"
                            >
                              Iniciar
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusChange(order._id, 'terminada')}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium"
                          >
                            Finalizar (Descontar Stock)
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}