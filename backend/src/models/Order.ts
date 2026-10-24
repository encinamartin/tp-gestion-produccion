import { Schema, model, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  producto: Types.ObjectId;
  cantidad: number;
  fechaEntregaComprometida: Date;
  estado: 'pendiente' | 'en_proceso' | 'terminada' | 'cancelada';
  creadoPor: Types.ObjectId; // Referencia al Planificador
  asignadoA?: Types.ObjectId; // Referencia al Operario asignado
}

const orderSchema = new Schema<IOrder>(
  {
    producto: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    cantidad: { type: Number, required: true, min: 1 },
    fechaEntregaComprometida: { type: Date, required: true },
    estado: {
      type: String,
      enum: ['pendiente', 'en_proceso', 'terminada', 'cancelada'],
      default: 'pendiente'
    },
    creadoPor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    asignadoA: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const Order = model<IOrder>('Order', orderSchema);