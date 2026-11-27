-- Token emitido antes desta data não vale mais: a troca de senha derruba as sessões abertas.
-- Em segundos inteiros, para comparar com o "iat" do token.
alter table representantes add column sessao_desde timestamptz not null default date_trunc('second', now());
