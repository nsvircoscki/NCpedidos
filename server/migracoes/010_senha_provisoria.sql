-- Senha provisória: quem recebeu a senha do admin (ou da importação) cria a sua no primeiro login.
-- Os representantes de hoje receberam a senha pronta: todos criam a sua, e as sessões abertas caem.
alter table representantes add column trocar_senha boolean not null default false;
update representantes set trocar_senha = true, sessao_desde = date_trunc('second', now()) where not admin;
