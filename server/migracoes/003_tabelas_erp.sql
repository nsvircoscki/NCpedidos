alter table itens_tabela alter column preco drop not null;

create table tabelas_erp (
    codigo text primary key,
    nome text,
    base text not null,
    codigo_erp text not null
);