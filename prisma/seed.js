process.env.DATABASE_URL = 'file:./prisma/dev.db';

const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const crypto = require('crypto');

// In Prisma v7, we configure the adapter using PrismaLibSql
const adapter = new PrismaLibSql({
  url: 'file:./prisma/dev.db'
});
const prisma = new PrismaClient({ adapter });

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

async function main() {
  console.log('Seeding database...');

  // Clean DB
  await prisma.ticket.deleteMany({});
  await prisma.user.deleteMany({});

  // Hashes
  const adminHash = await hashPassword('admin123');
  const user1Hash = await hashPassword('miembro123');
  const user2Hash = await hashPassword('miembro123');

  // Create Users
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      passwordHash: adminHash,
      name: 'Administrador Principal',
      role: 'ADMIN'
    }
  });

  const member1 = await prisma.user.create({
    data: {
      username: 'miembro1',
      passwordHash: user1Hash,
      name: 'Juan Pérez',
      role: 'MEMBER'
    }
  });

  const member2 = await prisma.user.create({
    data: {
      username: 'miembro2',
      passwordHash: user2Hash,
      name: 'María Gómez',
      role: 'MEMBER'
    }
  });

  console.log('Seeded users:', { admin: admin.username, member1: member1.username, member2: member2.username });

  // Create some sold tickets
  await prisma.ticket.createMany({
    data: [
      {
        number: 7,
        clientName: 'Carlos Mendoza',
        clientPhone: '999999999',
        price: 10.0,
        paid: true,
        soldById: member1.id
      },
      {
        number: 14,
        clientName: 'Ana Delgado',
        clientPhone: '988888888',
        price: 10.0,
        paid: false,
        soldById: member1.id
      },
      {
        number: 25,
        clientName: 'Luis Rojas',
        clientPhone: '977777777',
        price: 12.0,
        paid: true,
        soldById: member2.id
      }
    ]
  });

  console.log('Seeded tickets!');
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
