<!-- ========================================== -->
<!-- 1. ENCABEZADO Y DESCRIPCIÓN DEL PROYECTO   -->
<!-- ========================================== -->
# Sistema de Gestión de Producción para PyMEs (`tp-gestion-produccion`)

Sistema web integral de control de inventario, recetas de fabricación (BOM), gestión de proveedores y automatización del ciclo de vida de órdenes de producción. Diseñado para optimizar procesos industriales en pequeñas y medianas empresas.

---

<!-- ========================================== -->
<!-- 2. STACK TECNOLÓGICO UTILIZADO            -->
<!-- ========================================== -->
## 🛠️ Stack Tecnológico

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Lucide React, Axios, React Router DOM.
- **Backend**: Node.js, Express, TypeScript, Mongoose.
- **Base de Datos**: MongoDB (Mongoose ORM).
- **Autenticación & Seguridad**: JWT (JSON Web Tokens), bcryptjs, Middleware de control de acceso basado en roles (RBAC).
- **Seguimiento & Logs**: Winston Logger.

---

<!-- ========================================== -->
<!-- 3. ARQUITECTURA Y MÓDULOS DEL SISTEMA      -->
<!-- ========================================== -->
## 🧱 Módulos del Sistema

### 1. Autenticación y Control de Accesos (`/api/auth`)
- Registro de usuarios e inicio de sesión seguro.
- Gestión de roles con permisos específicos:
  - **Planificador**: Emisión de órdenes de producción y gestión de inventario/recetas.
  - **Operario**: Ejecución y actualización del estado de las órdenes de fabricación.
  - **Administrador**: Gestión global del sistema.

### 2. Gestión de Productos e Insumos (`/api/products`)
- **Insumos / Materias Primas**: Registro de stock actual, unidades de medida y alertas de stock mínimo.
- **Productos Terminados**: Definición de recetas (Bill of Materials - BOM) asociando cantidades requeridas de materia prima por unidad producida.

### 3. Módulo de Órdenes de Producción (`/api/orders`)
- Automatización del ciclo de vida de la orden de fabricación:
  - **`pendiente`**: Estado inicial tras la emisión por parte del planificador.
  - **`en_proceso`**: Transición que desencadena la **verificación y descuento automático de insumos/materias primas** del inventario según la receta (BOM).
  - **`terminada`**: Cierre de la orden que impacta en el inventario **sumando las unidades del producto terminado** fabricado.
  - **`cancelada`**: Aborto de la orden sin modificar existencias.

### 4. Gestión de Proveedores (`/api/suppliers`)
- Administración de catálogo de proveedores, datos de contacto e historial de compras/insumos asociados.

---

<!-- ========================================== -->
<!-- 4. ENDPOINTS PRINCIPALES DE LA API        -->
<!-- ========================================== -->
## 🔌 Endpoints de la API REST

### Autenticación
- `POST /api/auth/register` - Registro de nuevos usuarios.
- `POST /api/auth/login` - Autenticación y generación del Token JWT.
- `GET /api/auth/me` - Verificación de perfil y rol de usuario activo.

### Inventario y Recetas
- `GET /api/products` - Listar insumos y productos terminados.
- `POST /api/products` - Crear insumo o producto terminado con su receta (BOM).
- `PUT /api/products/:id` - Actualizar producto o niveles de stock.
- `DELETE /api/products/:id` - Eliminar producto del sistema.

### Órdenes de Producción
- `GET /api/orders` - Obtener listado de órdenes registradas.
- `POST /api/orders` - Crear nueva orden de producción (*Requiere rol Planificador*).
- `PATCH /api/orders/:id/status` - Transicionar estado de la orden (`pendiente` ➔ `en_proceso` ➔ `terminada`).

### Proveedores
- `GET /api/suppliers` - Listar proveedores registrados.
- `POST /api/suppliers` - Crear registro de proveedor.

---

<!-- ========================================== -->
<!-- 5. INSTRUCCIONES DE INSTALACIÓN Y EJECUCIÓN-->
<!-- ========================================== -->
## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- Node.js (v18 o superior)
- Servidor MongoDB activo (Local o MongoDB Atlas)

### 1. Configuración del Backend
```bash
cd backend
npm install