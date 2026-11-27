-- Verificação em duas etapas (código do app autenticador): obrigatória para o admin, opcional para os outros.
-- O segredo fica cifrado (src/cifra.ts). ultimo_passo: o mesmo código não vale duas vezes.
alter table representantes
    add column totp_segredo text,
    add column totp_ativo boolean not null default false,
    add column totp_ultimo_passo bigint not null default 0;
