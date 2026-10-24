import { useState, useEffect, FormEvent } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Package, RefreshCw, Plus, Layers } from 'lucide-react';

interface Item {
  _id: string;
  nombre: string;
  codigo: string;
  tipo: 'insumo' | 'producto_terminado';
  stock: number;
  unidadMedida: string;
}

export default function Inventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Modal de creación
  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [tipo, setTipo] = useState<'insumo' | 'producto_terminado'>('insumo');
  const [stock, setStock] = useState(0);
  const [unidadMedida, setUnidadMedida] = useState('unidades');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      setItems(response.data);
    } catch (err) {
      console.error('Error al cargar inventario', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleCreateProduct = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        nombre,
        codigo,
        tipo,
        stock,
        unidadMedida,
      });
      setShowModal(false);
      setNombre('');
      setCodigo('');
      setStock(0);
      fetchInventory();
    } catch (err) {
      console.error('Error al crear producto', err);
      alert('Error al guardar el ítem en el inventario');
    }
  };

  const handleUpdateStock = async (id: string, nuevoStock: number) => {
    if (nuevoStock < 0) return;
    try {
      await api.patch(`/products/${id}/stock`, { stock: nuevoStock });
      setItems((prev) =>
        prev.map((item) => (item._id === id ? { ...item, stock: nuevoStock } : item))
      );
    } catch (err) {
      console.error('Error al actualizar stock', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Control de Inventario</h1>
            <p className="text-gray-600">Existencias en tiempo real de insumos y productos terminados</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchInventory}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium"
            >
              <RefreshCw size={18} />
              <span>Actualizar</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
            >
              <Plus size={18} />
              <span>Agregar Ítem</span>
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Cargando stock...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                      <Package size={24} />
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                        item.tipo === 'insumo' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.tipo.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-gray-400 mb-1">{item.codigo}</p>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">{item.nombre}</h3>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-gray-900">{item.stock}</span>
                    <span className="text-sm font-medium text-gray-500">{item.unidadMedida}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateStock(item._id, item.stock - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-base transition"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleUpdateStock(item._id, item.stock + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-base transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Alta de Insumos/Productos */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                <Layers className="text-blue-600" /> Agregar al Inventario
              </h2>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ej. Chapa de Acero"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código / SKU</label>
                  <input
                    type="text"
                    required
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ej. INS-ACERO"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Elemento</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as 'insumo' | 'producto_terminado')}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="insumo">Insumo (Materia Prima)</option>
                    <option value="producto_terminado">Producto Terminado</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                    <input
                      type="text"
                      required
                      value={unidadMedida}
                      onChange={(e) => setUnidadMedida(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="unidades, kg, m"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}