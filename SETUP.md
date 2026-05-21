# FinançasPro — Setup Guide

## 1. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No SQL Editor, execute o conteúdo de `supabase/schema.sql`
3. Em **Authentication → Settings**, habilite confirmação por e-mail se desejar (opcional para dev)

## 2. Configurar variáveis de ambiente

Edite o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Pegue esses valores em: **Supabase Dashboard → Project Settings → API**

## 3. Instalar dependências e rodar

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

## 4. Deploy na Vercel

1. Suba o projeto para o GitHub
2. Importe o repositório na [Vercel](https://vercel.com)
3. Configure as mesmas env vars (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy automático a cada push no main

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui** (base-ui)
- **Supabase** (Auth + PostgreSQL + RLS)
- **Recharts** (gráficos)
