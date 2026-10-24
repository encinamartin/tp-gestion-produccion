import { Schema, model, Document, Types } from 'mongoose';

// Subesquema para los ítems de la receta
interface IRecetaItem {
  insumo: Types.ObjectId; // Referencia a otro documento de tipo 'Insumo'
  cantidadRequerida: number;
}

export interface IProduct extends Document {
  nombre: string;
  codigo: string;
  tipo: 'insumo' | 'producto_terminado';
  stock: number;
  unidadMedida: string; // ej: 'kg', 'unidades', 'litros'
  receta?: IRecetaItem[]; // Solo aplica si tipo === 'producto_terminado'
}

const productSchema = new Schema<IProduct>(
  {
    nombre: { type: String, required: true, trim: true },
    codigo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    tipo: { 
      type: String, 
      enum: ['insumo', 'producto_terminado'], 
      required: true 
    },
    stock: { type: Number, required: true, default: 0 },
    unidadMedida: { type: String, required: true, default: 'unidades' },
    receta: [
      {
        insumo: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        cantidadRequerida: { type: Number, required: true, min: 1 }
      }
    ]
  },
  { timestamps: true }
);

export const Product = model<IProduct>('Product', productSchema);