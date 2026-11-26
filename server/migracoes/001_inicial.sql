create table representantes (
    id serial primary key,
    nome text not null,
    email text not null unique,
    senha_hash text not null,
    criado_em timestamptz not null default now()
);

-- Cada planilha do ERP é a tabela de preço de um cliente do representante.
create table clientes (
    id serial primary key,
    representante_id integer not null references representantes on delete cascade,
    nome text not null,
    codigo_tabela text not null,
    tabela_emitida_em timestamptz,
    unique (representante_id, codigo_tabela)
);

create table produtos (
    codigo text primary key,
    descricao text not null,
    unidade text not null
);

-- O preço fica guardado para uso futuro; a API do MVP não o envia para a tela nem para o PDF.
create table itens_tabela (
    cliente_id integer not null references clientes on delete cascade,
    produto_codigo text not null references produtos,
    preco numeric(12, 2) not null,
    primary key (cliente_id, produto_codigo)
);
