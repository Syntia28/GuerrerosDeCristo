import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    DATABASE_URL_defined: !!process.env.DATABASE_URL,
    DATABASE_URL_prefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 10) : null,
    TURSO_DATABASE_URL_defined: !!process.env.TURSO_DATABASE_URL,
    TURSO_DATABASE_URL_prefix: process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.substring(0, 10) : null,
    DATABASE_AUTH_TOKEN_defined: !!process.env.DATABASE_AUTH_TOKEN,
    TURSO_AUTH_TOKEN_defined: !!process.env.TURSO_AUTH_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  });
}
