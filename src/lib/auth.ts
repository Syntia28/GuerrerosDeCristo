import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "guerreros-de-cristo-super-secret-key-12345"
);

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const parts = hash.split(":");
    if (parts.length !== 2) {
      resolve(false);
      return;
    }
    const [salt, key] = parts;
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      const keyBuffer = Buffer.from(key, "hex");
      const derivedBuffer = derivedKey;
      if (keyBuffer.length !== derivedBuffer.length) {
        resolve(false);
        return;
      }
      resolve(crypto.timingSafeEqual(keyBuffer, derivedBuffer));
    });
  });
}

export async function createToken(payload: { id: number; role: string; name: string; usernameOrPhone: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { id: number; role: string; name: string; usernameOrPhone: string };
  } catch (err) {
    return null;
  }
}
