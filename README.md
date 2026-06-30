# Flujo de Compra Online de Rifa — Guía de instalación

## 1. Archivos y dónde van

| Archivo descargado          | Colócalo en tu proyecto en...                  |
|------------------------------|-------------------------------------------------|
| `schema.prisma`              | `prisma/schema.prisma` (reemplaza el actual)     |
| `session.ts`                 | `src/lib/session.ts` (nuevo archivo)             |
| `orders-route.ts`            | `src/app/api/orders/route.ts` (nuevo archivo)    |
| `orders-id-route.ts`         | `src/app/api/orders/[id]/route.ts` (nuevo archivo, OJO con la carpeta `[id]` con corchetes) |
| `comprar-page.tsx`           | `src/app/rifa/comprar/page.tsx` (nuevo archivo)  |
| `ordenes-admin-page.tsx`     | `src/app/dashboard/admin/ordenes/page.tsx` (nuevo)|

## 2. Ajustes que TÚ debes verificar antes de que funcione

1. **Import de Prisma** (`@/lib/db`): en `orders-route.ts` y `orders-id-route.ts` puse
   `import { prisma } from "@/lib/db";` — si tu archivo donde inicializas
   `new PrismaClient()` se llama distinto (ej. `lib/prisma.ts`), corrige el import.

2. **Nombre de la cookie de sesión** (`src/lib/session.ts`, línea con `cookieStore.get("token")`):
   ajústalo al nombre real que usas al hacer login. Búscalo en tu
   `src/app/api/auth/login/route.ts`, en la línea `cookies().set(...)`.

3. **Después de actualizar el schema**, corre en tu terminal:
   ```bash
   npx prisma migrate dev --name add_ticket_orders
   npx prisma generate
   ```

4. **Agregar el link "Comprar Boletos"**: en tu `page.tsx` principal (home), dentro de la
   sección "Gran Rifa Anual", agrega un botón que lleve a `/rifa/comprar`, por ejemplo
   junto al botón "Ver Premios y Consultar Boleto" que ya tienes.

5. **Acceso al panel de admin**: agrega un link a `/dashboard/admin/ordenes` en tu
   Navbar, dentro del bloque que ya muestra "Admin" cuando `user.role === "ADMIN"`.

## 3. Seguridad — IMPORTANTE

Revisa que la variable de entorno `JWT_SECRET` esté configurada en Vercel
(Settings → Environment Variables). Tu código actual tiene un valor por
defecto inseguro si esa variable falta — sin la variable configurada,
cualquiera podría forjar un token de administrador.

## 4. Cómo funciona el flujo

1. Cliente entra a `/rifa/comprar`, llena nombre/teléfono, elige cantidad,
   ve el QR de Yape y sube su comprobante (foto/captura).
2. Se crea un `TicketOrder` con estado `PENDIENTE` (la imagen se guarda como
   base64 directamente en la base de datos, sin servicios externos).
3. Un admin entra a `/dashboard/admin/ordenes`, ve el comprobante en miniatura
   (clic para ampliar) y aprueba o rechaza.
4. Al aprobar, se generan automáticamente los `Ticket` correspondientes con
   números consecutivos a partir del último boleto existente, ya marcados
   como pagados.

## 5. Pendiente / mejoras futuras posibles
- Notificar al cliente por WhatsApp automáticamente cuando se aprueba (requiere
  una API de WhatsApp Business, no incluido aquí).
- Mostrar al admin un historial de pedidos aprobados/rechazados (ahora mismo
  el GET solo trae los `PENDIENTE`, pero el filtro por `status` ya existe).
