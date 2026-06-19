import * as PrismaPkg from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const PrismaClient = (PrismaPkg as any).PrismaClient;

let _prismaInstance: any | undefined;

const createPrismaClient = () => {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || "file:./prisma/dev.db"
  });
  return new PrismaClient({ adapter });
};

const getPrisma = () => {
  if (!_prismaInstance) {
    _prismaInstance = createPrismaClient();
  }
  return _prismaInstance;
};

// Export a proxy so importing `db` does not instantiate Prisma immediately.
// Accessing properties (e.g., db.user) will initialize the client lazily.
export const db: any = new Proxy(
  {},
  {
    get(_target, prop) {
      try {
        return (getPrisma() as any)[prop];
      } catch (err) {
        // Re-throw with clearer message for build logs
        throw new Error(
          `Prisma client initialization failed: ${(err as Error).message}. Ensure DATABASE_URL is set in the environment.`
        );
      }
    }
  }
);

if (process.env.NODE_ENV !== "production") {
  // Attach instance for hot-reload in development
  (globalThis as any)._prisma = _prismaInstance;
}
