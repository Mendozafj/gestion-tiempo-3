const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const runMigrations = async () => {
    // Conectar sin especificar la base de datos
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true, // Permite ejecutar múltiples sentencias SQL
    });

    try {
        // Crear la base de datos si no existe
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log(`Base de datos "${process.env.DB_NAME}" creada o ya existente.`);

        // Usar la base de datos
        await connection.query(`USE ${process.env.DB_NAME}`);
        console.log(`Usando la base de datos "${process.env.DB_NAME}".`);

        // Leer y ejecutar cada archivo de migración
        const migrationFiles = fs.readdirSync(path.join(__dirname)).sort();
        for (const file of migrationFiles) {
            if (file.endsWith('.sql')) { // Solo procesar archivos .sql
                const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
                console.log(`Ejecutando migración: ${file}`);
                await connection.query(sql);
            }
        }
        console.log('Todas las migraciones se ejecutaron correctamente.');
    } catch (error) {
        console.error('Error ejecutando migraciones:', error);
    } finally {
        await connection.end();
    }
};

runMigrations();