const mysql = require('mysql2/promise');
 require('dotenv').config();
 
 const pool = mysql.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME
 });
 
 // Verificar la conexión al obtener una conexión del pool
 (async () => {
   try {
       const connection = await pool.getConnection();
       console.log('Conexión a la base de datos establecida correctamente.');
       connection.release(); // Liberar la conexión al finalizar
   } catch (error) {
       console.error('Error al conectar con la base de datos:', error);
   }
 })();
 
 module.exports = pool;