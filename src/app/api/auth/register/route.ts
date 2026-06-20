import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { hashPassword, createToken } from "@/lib/auth";

export async function POST(req: Request) {
  return NextResponse.json(
    { error: "El registro público de cuentas está deshabilitado. Solicita una cuenta al Administrador." },
    { status: 403 }
  );
}
