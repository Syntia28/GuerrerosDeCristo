const { createClient } = require('@libsql/client');
const { execSync } = require('child_process');
require('dotenv').config();

const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

if (!url || url.startsWith('file:')) {
  console.error("Error: Se necesita una URL de conexión de Turso (https:// o libsql://) en tu archivo .env.");
  process.exit(1);
}

console.log("Conectando a Turso:", url);

const client = createClient({
  url,
  authToken
});

async function main() {
  console.log("Creando tablas en Turso...");
  
  const sqlStatements = [
    `CREATE TABLE IF NOT EXISTS "User" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "username" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'MEMBER',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS "Ticket" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "number" INTEGER NOT NULL,
        "clientName" TEXT NOT NULL,
        "clientPhone" TEXT NOT NULL,
        "price" REAL NOT NULL DEFAULT 10.0,
        "paid" BOOLEAN NOT NULL DEFAULT false,
        "soldById" INTEGER NOT NULL,
        "soldAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Ticket_soldById_fkey" FOREIGN KEY ("soldById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Ticket_number_key" ON "Ticket"("number");`
  ];

  for (const statement of sqlStatements) {
    try {
      await client.execute(statement);
    } catch (e) {
      console.error("Error ejecutando SQL:", statement, e.message);
    }
  }

  console.log("¡Tablas creadas con éxito en Turso!");

  console.log("Ejecutando seed.js en la base de datos de Turso...");
  execSync('node prisma/seed.js', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: url,
      DATABASE_AUTH_TOKEN: authToken
    }
  });

  console.log("¡Migración y carga de datos completada con éxito!");
}

main()
  .catch(console.error)
  .finally(() => client.close());
