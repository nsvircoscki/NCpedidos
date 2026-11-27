-- Cliente aponta para a tabela do ERP; a tabela e os itens dela valem para todos os representantes.
drop table itens_tabela;
drop table clientes;

create table itens_tabela (
    tabela_codigo text not null references tabelas_erp on delete cascade,
    produto_codigo text not null references produtos,
    preco numeric(12, 2),
    primary key (tabela_codigo, produto_codigo)
);

create table clientes (
    id serial primary key,
    codigo text not null unique,
    representante_id integer not null references representantes on delete cascade,
    nome text not null,
    documento text not null,
    cidade text not null,
    uf text not null,
    tabela_codigo text not null references tabelas_erp
);
