-- O pedido não precisa do CNPJ/CPF do cliente: guardar só o necessário (LGPD). O nome identifica o cliente.
alter table clientes drop column documento;
