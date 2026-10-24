# Mi Mercado

App para organizar las compras del hogar y controlar los gastos.

## Desarrollo local

Copia `.env.example` a `.env.local` y completa las dos variables públicas de Supabase. Luego:

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Desplegar en Vercel

El repositorio de Git es esta carpeta (`my-app`). En [Vercel](https://vercel.com/new):

1. Importa el repo `yitsoler/app-mercado`.
2. Deja **Framework Preset** en Next.js y **Root Directory** vacío (la raíz ya es la app).
3. En **Environment Variables** agrega, para Production, Preview y Development:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. No subas la service role, la contraseña de la base ni claves de correo. La app no las necesita en Vercel.
5. Publica. Copia la URL (`https://….vercel.app`).

En Supabase → **Authentication** → **URL Configuration**:

- **Site URL**: la URL de Vercel.
- **Redirect URLs**: esa misma URL y `https://….vercel.app/**`.

La función `household-admin` ya está en Supabase y admite el origen de Vercel.
