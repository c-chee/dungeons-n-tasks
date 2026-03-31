import mysql from "mysql2/promise";

const globalForDb = globalThis;

const pool =
    globalForDb.mysqlPool ||
    mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,

        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
    });

globalForDb.mysqlPool = pool;

export default pool;