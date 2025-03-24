# gestion-tiempo-3
Este proyecto consiste en el desarrollo de una aplicación de gestión del tiempo como parte de una actividad educativa. La aplicación permite gestionar usuarios, actividades, categorías, hábitos y proyectos, ayudando a los usuarios a organizar su tiempo de manera eficiente. El sistema está desarrollado en **Node.js** utilizando **Express** para manejar el enrutamiento y gestionar las rutas HTTP, con base de datos **MySQL** para la persistencia de datos. Y ahora incluye un mecanismo de autenticación de usuarios y manejo de roles.

## Características
- **Gestión de usuarios**: Registro, actualización y eliminación de perfiles de usuario (Rutas para los usuarios con rol admin).
- **Gestión de actividades**: Creación, visualización, edición y eliminación de actividades.
- **Gestión de categorías**: Creación, visualización, edición y eliminación de categorías.
- **Gestión de hábitos**: Creación, visualización, edición y eliminación de hábitos.
- **Gestión de proyectos**: Creación, visualización, edición y eliminación de proyectos.
- **Relaciones entre entidades**: Asociación de actividades con categorías, hábitos y proyectos.
- **Vistas interactivas**: Interfaz gráfica para gestionar todad las entidades.

## Tecnologías utilizadas
- Node.js
- Express.js
- MySQL
- EJS (para las vistas)
- CSS
- JWT
- bcrypt

## Instalación
- **1.** Clona el repositorio:
```
git clone https://github.com/Mendozafj/gestion-tiempo-3.git
```
- **2.**  Ingresa al directorio del proyecto:
```
cd gestion-tiempo-3
```
- **3.**  Instala las dependencias:
```
npm install
```
- **4.**  Configura las variables de entorno:
Crea un archivo .env en la raíz del proyecto y agrega las siguientes variables:
```
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql
DB_DATABASE=gestion_tiempo
JWT_SECRET=tu_clave_secreta_JWT
```
- **5.** Ejecuta el script de migración para desplegar la base de datos:
```
npm run migrate
```

## Uso
- **1.** Ejecuta la aplicación: 
```
npm start
```
- **2.**  El servidor estará escuchando en el puerto `3000`:
```
http://localhost:3000/
```
- **3.**  Utiliza las rutas y métodos HTTP definidos en el servidor para gestionar usuarios, actividades, categorías, hábitos y proyectos. Además puedes utilizar las vistas del sistema para una mejor experiencia.
