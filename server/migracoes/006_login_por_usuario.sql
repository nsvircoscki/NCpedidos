-- Login pelo nome de usuário (ex.: rafael), não mais pelo e-mail.
alter table representantes rename column email to usuario;
update representantes set usuario = split_part(usuario, '@', 1);

-- Códigos do representante no ERP, um por base e por comissão ("PRI-65", "AST-59"): o cliente chega por eles.
create table representantes_erp (
    codigo text primary key,
    nome text not null,
    representante_id integer not null references representantes on delete cascade
);
