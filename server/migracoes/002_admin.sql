-- Administrador: cadastra os usuários (representantes) pela tela Usuários.
alter table representantes add column admin boolean not null default false;
