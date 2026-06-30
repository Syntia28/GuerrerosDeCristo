import { cookies } from "next/headers";
import { verifyToken } from "./auth";

/**
 * Lee el usuario actual a partir de la cookie de sesión.
 *
 * ⚠️ AJUSTA "token" si tu cookie de login se llama distinto.
 * Revisa tu archivo src/app/api/auth/login/route.ts y busca
 * la línea donde haces cookies().set("NOMBRE_DE_COOKIE", jwt, ...)
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}
