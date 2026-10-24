import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    rol: 'planificador' | 'operario';
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer <TOKEN>

  if (!token) {
    res.status(401).json({ message: 'Acceso denegado: Token no proporcionado' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secreto_super_seguro_pyme_2026'
    ) as { id: string; rol: 'planificador' | 'operario' };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

export const authorizeRoles = (...rolesPermitidos: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      res.status(403).json({ message: 'Acceso denegado: No tienes permisos suficientes' });
      return;
    }
    next();
  };
};