-- Moneto — Premium Plus Migration
-- Execute no SQL Editor do Supabase (Dashboard → SQL Editor)

-- Atualiza o check constraint para incluir 'premium_plus' e remover 'ltd'
alter table public.user_profiles
  drop constraint if exists user_profiles_plan_check;

alter table public.user_profiles
  add constraint user_profiles_plan_check
  check (plan in ('free', 'pro', 'premium_plus'));

-- Converte eventuais usuários 'ltd' existentes para 'premium_plus'
update public.user_profiles
  set plan = 'premium_plus', updated_at = now()
  where plan = 'ltd';
