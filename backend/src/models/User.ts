import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  nombre: string;
  email: string;
  password?: string;
  rol: 'planificador' | 'operario';
}

const userSchema = new Schema<IUser>(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    rol: { 
      type: String, 
      enum: ['planificador', 'operario'], 
      default: 'operario' 
    }
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);