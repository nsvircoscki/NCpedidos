-- O admin inativa o cliente em vez de remover: some da lista do representante, mas pode voltar.
alter table clientes rename column removido to inativo;
