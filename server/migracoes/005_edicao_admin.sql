-- O que o admin muda na tela fica como ele deixou: a importação do ERP pula o que tem data de edição.
-- Cliente cadastrado pelo admin não tem código no ERP. Cliente removido fica marcado, para a importação não trazer de volta.
alter table clientes alter column codigo drop not null;
alter table clientes add column editado_em timestamptz;
alter table clientes add column removido boolean not null default false;
alter table tabelas_erp add column editada_em timestamptz;
