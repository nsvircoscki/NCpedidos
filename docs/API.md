# Contrato da API (visão do front)

Formatos: JSON. Datas em ISO (`2026-11-16`). Valores em número com 2 casas (`289.9`).
Os tipos citados estão em `src/app/models/`.

## Clientes (`ClientesStore`)
| Verbo | Rota | Envia | Recebe |
|---|---|---|---|
| GET | /clientes | — | `Cliente[]` |
| GET | /clientes/:id | — | `Cliente` ou 404 |

## Pré-cadastros (`PreCadastrosStore`)
| Verbo | Rota | Envia | Recebe |
|---|---|---|---|
| GET | /pre-cadastros | — | `PreCadastro[]` |
| GET | /pre-cadastros/:id | — | `PreCadastro` |
| POST | /pre-cadastros | dados do formulário PJ/PF | `PreCadastro` (201) |
| POST | /pre-cadastros/:id/aprovar | — | `PreCadastro` |
| POST | /pre-cadastros/:id/recusar | `{ motivo }` | `PreCadastro` |

## Produtos (`ProdutoService`)
| Verbo | Rota | Envia | Recebe |
|---|---|---|---|
| GET | /produtos | — | `Produto[]` |
| GET | /produtos/:id | — | `Produto` |
| POST | /produtos | `Produto` sem `id` | `Produto` (201) |
| PUT | /produtos/:id | `Produto` sem `id` | `Produto` |

## Tabela de preços (`TabelasPrecoStore`)
| Verbo | Rota | Envia | Recebe |
|---|---|---|---|
| GET | /clientes/:id/tabela-precos | — | `ItemTabelaPreco[]` |
| PUT | /clientes/:id/tabela-precos/:itemId | `{ preco }` | `ItemTabelaPreco` |

## Pedidos (`PedidosStore`)
| Verbo | Rota | Envia | Recebe |
|---|---|---|---|
| GET | /pedidos?clienteId= | — | `PedidoDetalhado[]` |
| GET | /pedidos/:id | — | `PedidoDetalhado` |
| POST | /pedidos | `PedidoDetalhado` sem `id` | `PedidoDetalhado` (201) |
| POST | /pedidos/:id/aprovar | `{ previsaoEntrega }` (data `AAAA-MM-DD`) | `PedidoDetalhado` |
| POST | /pedidos/:id/recusar | `{ motivo }` | `PedidoDetalhado` |

## MVP do pedido rápido (branch `mvp/pedido-pdf`, implementado em `server/`)

A sessão vai no cookie `sessao` (HttpOnly, Secure, SameSite=Strict, caminho `/api`), gravado pelo login: o navegador
manda sozinho e o JavaScript não lê. Pedido que muda dados com `Origin` de outro site dá 403. Erros vêm como
`{ "erro": "mensagem" }`.

| Rota | Resposta |
| --- | --- |
| `POST /api/auth/login` `{ usuario, senha }` | `{ usuario: { id, nome, usuario, admin, trocarSenha, doisPassos } }` e o cookie; com verificação em duas etapas, `{ precisaCodigo: true }` e o cookie `login_pendente` (5 min); 401 se errado, 429 após 5 erros no usuário ou 10 no endereço em 15 min. Com `trocarSenha`, as outras rotas dão 403 até a pessoa criar a sua senha |
| `PUT /api/auth/senha` `{ senhaAtual, senhaNova }` | A própria pessoa troca a senha (e cria a sua no primeiro login): `{ usuario }` e cookie novo, e as outras sessões caem; 400 senha atual errada, senha nova curta, igual à atual ou com o nome de usuário |
| `POST /api/auth/login/codigo` `{ codigo }` | Segunda etapa: o código de 6 números do app autenticador. `{ usuario }` e o cookie; 400 código errado ou já usado; 401 sem a primeira etapa ou depois de 5 min |
| `POST /api/auth/sair` | 204; apaga o cookie |
| `POST /api/auth/dois-passos/iniciar` | `{ segredo, link }` para o app autenticador; 409 se já está ativa |
| `POST /api/auth/dois-passos/ativar` `{ codigo }` | `{ usuario }` com `doisPassos: true`; 400 código errado. Obrigatória para o admin: sem ela, as rotas de admin dão 403 |
| `GET /api/clientes` | `[{ id, codigo, nome, cidade, uf, codigoTabela, tabela, representanteId, editado, inativo }]`, só os ativos do usuário logado; `tabela` é o nome da tabela de preço; `codigo` é null no cliente cadastrado pelo admin |
| `GET /api/clientes/:id/produtos` | `[{ codigo, descricao, unidade, pedeDescricao? }]` (sem preço) da tabela do cliente, começando pelo `DESENV` (produto desenvolvimento, `pedeDescricao: true`); 404 se o cliente não é dele |
| `GET /api/usuarios` (admin) | `[{ id, nome, usuario, admin, clientes }]`; 403 se não é admin |
| `POST /api/usuarios` (admin) `{ nome, usuario, senha, admin }` | 201 com o usuário; 409 usuário repetido; 400 senha fora de 8 a 72 caracteres |
| `PUT /api/usuarios/:id` (admin) `{ nome, usuario, admin }` | 200 com o usuário; 409 usuário repetido; 400 dados inválidos ou tirar o próprio admin; 404 usuário não existe |
| `DELETE /api/usuarios/:id` (admin) | 204; apaga o usuário e os clientes dele (a importação do ERP não traz de volta); 400 ao excluir a si mesmo; 404 usuário não existe |
| `PUT /api/usuarios/:id/senha` (admin) `{ senha }` | 204; a senha de outra pessoa fica provisória (ela cria a sua no próximo login); 400 senha fora de 8 a 72 caracteres; 404 usuário não existe |
| `GET /api/auditoria` (admin) | `[{ id, quando, usuario, acao, detalhe, ip }]`, os 300 mais recentes: logins, trocas de senha e mudanças do admin |
| `GET /api/usuarios/:id/clientes` (admin) | os clientes do representante, no formato do `GET /api/clientes` |
| `POST /api/clientes` (admin) `{ representanteId, nome, cidade, uf, codigoTabela }` | 201 com o cliente (sem `codigo`); 400 dados inválidos, tabela ou representante que não existe |
| `PUT /api/clientes/:id` (admin) mesmo corpo | 200 com o cliente (troca tabela, representante e dados); 404 cliente não existe |
| `PUT /api/clientes/:id/ativo` (admin) `{ ativo }` | 200 com o cliente; inativo some do `GET /api/clientes` do representante, mas continua no `GET /api/usuarios/:id/clientes` (com `inativo: true`) e pode ser reativado; a importação não muda isso |
| `GET /api/tabelas` (admin) | `[{ codigo, nome, clientes, itens, editada }]`, só as tabelas com nome |
| `GET /api/tabelas/:codigo/itens` (admin) | `[{ codigo, descricao, unidade }]`; 404 tabela não existe |
| `PUT /api/tabelas/:codigo/itens` (admin) `{ produtos: ["2602.1", ...] }` | 204; troca os produtos da tabela (código que não existe é ignorado) |
| `GET /api/produtos?busca=verniz` (admin) | até 30 produtos pelo nome ou código; busca com menos de 2 letras devolve `[]` |

## Perguntas para o outro dev
1. Preço por cliente: hoje existe em dois lugares (tabela de preços e `precosPorCliente`
   do produto) com valores diferentes. Qual é a fonte única?
2. O pedido vem com nome/documento/cidade do cliente, ou só `clienteId`?
3. Os ids são números ou códigos (UUID)?
4. Quais status existem para pedido e pré-cadastro? (front: Em análise, Aprovado,
   Recusado, Faturado / Aguardando análise, Em revisão, Documentação pendente, Aprovado, Recusado)
5. Quem calcula total, desconto e volumes do pedido: front ou backend?
6. Login (fica por último): como vai ser a autenticação (token, sessão)?
7. Tabela de preços: o front carrega todas de uma vez (`GET /tabelas-preco`, provisório).
   A API vai ter essa rota ou só `/clientes/:id/tabela-precos`?