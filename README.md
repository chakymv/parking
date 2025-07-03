# Parking Lot Manual ORM

Este proyecto es un backend para la gestión de parqueaderos, implementado en Node.js con un ORM manual. Permite administrar usuarios, vehículos, celdas, accesos, historial, incidencias y restricciones de pico y placa, todo a través de modelos y endpoints REST.

## Descripción General
- **Tecnologías:** Node.js, Express, MySQL/PostgreSQL/Supabase
- **Estructura:** Modelos ORM manuales, rutas REST, pruebas unitarias
- **Funcionalidad:** CRUD completo para todas las entidades principales del parqueadero

## Modelos Principales
- **Usuario:** Información de usuarios
- **Vehiculo:** Vehículos registrados
- **Celda:** Espacios de parqueo
- **AccesoSalida:** Entradas y salidas de vehículos
- **PerfilUsuario, PicoPlaca, Incidencia, ReporteIncidencia, HistorialParqueo**

## Endpoints de la API de Usuario
Base URL: `/api/usuarios`

### 1. Obtener todos los usuarios
- **GET** `/api/usuarios`
- **Respuesta:** Array de usuarios
```json
[
  {
    "id_usuario": 1,
    "tipo_documento": "CC",
    "numero_documento": "123456789",
    "primer_nombre": "Juan",
    "segundo_nombre": "Carlos",
    "primer_apellido": "Pérez",
    "segundo_apellido": "Lopez",
    "direccion_correo": "juan@email.com",
    "numero_celular": "3001234567",
    "foto_perfil": "img/juan.jpg",
    "estado": "activo",
    "clave": "...",
    "perfil_usuario_id": 3
  },
  ...
]
```

### 2. Obtener usuario por ID
- **GET** `/api/usuarios/:id`
- **Respuesta exitosa:** Usuario en formato JSON
- **Respuesta error:** `{ "error": "Usuario no encontrado" }`

### 3. Obtener usuario por número de documento
- **GET** `/api/usuarios/documento/:numero`
- **Respuesta exitosa:** Usuario en formato JSON
- **Respuesta error:** `{ "error": "Usuario no encontrado" }`

### 4. Crear un nuevo usuario
- **POST** `/api/usuarios`
- **Body (JSON):**
```json
{
  "tipo_documento": "CC",
  "numero_documento": "123456789",
  "primer_nombre": "Juan",
  "segundo_nombre": "Carlos",
  "primer_apellido": "Pérez",
  "segundo_apellido": "Lopez",
  "direccion_correo": "juan@email.com",
  "numero_celular": "3001234567",
  "foto_perfil": "img/juan.jpg",
  "estado": "activo",
  "clave": "password123",
  "perfil_usuario_id": 3
}
```
- **Respuesta exitosa:** Usuario creado (JSON)
- **Respuesta error:** `{ "error": "<mensaje>" }`

### 5. Actualizar usuario por ID
- **PUT** `/api/usuarios/:id`
- **Body (JSON):** Cualquier campo editable del usuario
- **Respuesta exitosa:** Usuario actualizado (JSON)
- **Respuesta error:** `{ "error": "Usuario no encontrado" }`

### 6. Eliminar usuario por ID
- **DELETE** `/api/usuarios/:id`
- **Respuesta exitosa:** `{ "mensaje": "Usuario eliminado" }`
- **Respuesta error:** `{ "error": "Usuario no encontrado" }`

## Estructura de Respuesta de Usuario
```json
{
  "id_usuario": 1,
  "tipo_documento": "CC",
  "numero_documento": "123456789",
  "primer_nombre": "Juan",
  "segundo_nombre": "Carlos",
  "primer_apellido": "Pérez",
  "segundo_apellido": "Lopez",
  "direccion_correo": "juan@email.com",
  "numero_celular": "3001234567",
  "foto_perfil": "img/juan.jpg",
  "estado": "activo",
  "clave": "...",
  "perfil_usuario_id": 3
}
```

## Pruebas y Ejecución
- Ejecuta `npm install` para instalar dependencias
- Inicia el servidor con `npm start`
- Ejecuta pruebas unitarias con `npm test`

## Notas
- Configura la conexión a la base de datos en `DatabaseConnection.js`
- Consulta el archivo `example-orm-usage.js` para ejemplos prácticos de uso
- El sistema incluye validaciones y manejo de errores detallado
