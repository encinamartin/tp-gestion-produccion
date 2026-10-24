import { Schema, model, Document, Types } from 'mongoose';

// Interfaz para la compra de insumos
export interface IPurchase extends Document {
  proveedor: Types.ObjectId;
  insumo: Types.ObjectId;
  cantidad: number;
  precioUnitario: number;
  fechaCompra: Date;
}

// Interfaz para el proveedor
export interface ISupplier extends Document {
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
}

const supplierSchema = new Schema<ISupplier>(
  {
    nombre: { type: String, required: true, trim: true },
    contacto: { type: String, required: true, trim: true },
    telefono: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true }
  },
  { timestamps: true }
);

const purchaseSchema = new Schema<IPurchase>(
  {
    proveedor: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    insumo: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    cantidad: { type: Number, required: true, min: 1 },
    precioUnitario: { type: Number, required: true, min: 0 },
    fechaCompra: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Supplier = model<ISupplier>('Supplier', supplierSchema);
export const Purchase = model<IPurchase>('Purchase', purchaseSchema);