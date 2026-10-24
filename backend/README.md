<!-- ========================================== -->
<!-- 1. ENCABEZADO Y DESCRIPCIÓN DEL BACKEND   -->
<!-- ========================================== -->
# API REST - Sistema de Gestión de Producción para PyMEs

Servidor backend construido con Node.js, Express, TypeScript y MongoDB. Proporciona la capa de lógica de negocio, autenticación mediante JWT, control de acceso basado en roles (RBAC) y la automatización del ciclo de vida de inventarios y órdenes de producción.

---

<!-- ========================================== -->
<!-- 2. ESTRUCTURA DEL PROYECTO (BACKEND)      -->
<!-- ========================================== -->
## 📁 Estructura del Directorio
---

<!-- ========================================== -->
<!-- 3. MODELOS DE DATOS Y FLUJOS AUTOMÁTICOS   -->
<!-- ========================================== -->
## 🗄️ Modelos Principales de Datos

### 1. Usuario (`User`)
- **Campos**: `nombre`, `email`, `password` (hasheado con bcryptjs), `rol` (`'planificador' | 'operario' | 'administrador'`).

### 2. Producto / Insumo (`Product`)
- **Campos**: `nombre`, `codigo`, `descripcion`, `categoria`, `unidadMedida`, `stock`, `stockMinimo`, `tipo` (`'insumo' | 'producto_terminado'`), `receta` (BOM - Bill of Materials: array de insumos y cantidades requeridas).

### 3. Orden de Producción (`Order`)
- **Campos**: `producto` (Ref: Product), `cantidad`, `estado` (`'pendiente' | 'en_proceso' | 'terminada' | 'cancelada'`), `creadoPor` (Ref: User), `asignadoA` (Ref: User), `fechaEntregaComprometida`.

### 🔄 Lógica del Ciclo de Vida de Órdenes:
1. **Transición a `en_proceso`**: Valida disponibilidad en stock de materias primas según la receta (BOM) y **descuenta automáticamente los insumos** requeridos.
2. **Transición a `terminada`**: Incrementa automáticamente el stock del **producto terminado** fabricado.

---

<!-- ========================================== -->
<!-- 4. SEGURIDAD Y CONTROL DE ACCESO (RBAC)   -->
<!-- ========================================== -->
## 🔒 Autenticación y Permisos

- **Token JWT**: Requerido en la cabecera `Authorization: Bearer <TOKEN>` para todos los endpoints protegidos.
- **Middlewares de Control**:
  - `authenticateToken`: Verifica la validez y vigencia del token de sesión.
  - `authorizeRoles('planificador', ...)`: Restringe acciones sensibles (como creación de órdenes) según el rol del usuario.

---

<!-- ========================================== -->
<!-- 5. INSTRUCCIONES DE EJECUCIÓN              -->
<!-- ========================================== -->
## 🚀 Ejecución del Servidor

### Modo Desarrollo
```bash
npm run dev