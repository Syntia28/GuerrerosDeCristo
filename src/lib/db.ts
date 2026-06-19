import * as PrismaPkg from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const PrismaClient = (PrismaPkg as any).PrismaClient;

const globalForPrisma = globalThis as unknown as { prisma?: any };

const getPrismaClient = () => {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || "file:./prisma/dev.db"
  });
  return new PrismaClient({ adapter });
};

export const db = globalForPrisma.prisma || getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
