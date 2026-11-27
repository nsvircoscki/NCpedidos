-- Usuário excluído pelo admin não volta na importação: os códigos dele no ERP ficam, sem usuário,
-- e os clientes desses códigos não são importados.
alter table representantes_erp alter column representante_id drop not null;
alter table representantes_erp drop constraint representantes_erp_representante_id_fkey;
alter table representantes_erp add constraint representantes_erp_representante_id_fkey
    foreign key (representante_id) references representantes on delete set null;
