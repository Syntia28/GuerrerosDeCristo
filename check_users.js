const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const adapter = new PrismaLibSql({
  url: 'file:./prisma/dev.db'
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      role: true
    }
  });
  console.log("USERS_LIST:", JSON.stringify(users));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
