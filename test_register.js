const crypto = require("crypto");
const { SignJWT } = require("jose");
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const adapter = new PrismaLibSql({
  url: 'file:./prisma/dev.db'
});
const prisma = new PrismaClient({ adapter });

const JWT_SECRET = new TextEncoder().encode("guerreros-de-cristo-super-secret-key-12345");

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

async function createToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

async function main() {
  const passwordHash = await hashPassword("my-password");
  console.log("passwordHash:", passwordHash);
  
  const user = await prisma.user.create({
    data: {
      name: "Flow User",
      username: "flowuser",
      passwordHash,
      role: "MEMBER"
    }
  });
  console.log("user:", user);
  
  const token = await createToken({
    id: user.id,
    role: user.role,
    name: user.name,
    usernameOrPhone: user.username
  });
  console.log("token:", token);
}

main().catch(console.error).finally(() => prisma.$disconnect());
