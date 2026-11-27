-- Quem fez o quê e quando: logins, trocas de senha e mudanças do admin.
-- Sem chave estrangeira: o registro fica mesmo depois que o usuário é excluído.
create table auditoria (
    id bigserial primary key,
    quando timestamptz not null default now(),
    usuario_id integer,
    usuario text not null,
    acao text not null,
    detalhe text not null default '',
    ip text not null default ''
);
create index auditoria_quando on auditoria (quando desc);
