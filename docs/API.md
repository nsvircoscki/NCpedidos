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
| POST | /pre-cadastros/:id/recusar | — | `PreCadastro` |

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
| POST | /pedidos/:id/aprovar | — | `PedidoDetalhado` |
| POST | /pedidos/:id/recusar | `{ motivo }` | `PedidoDetalhado` |

## Perguntas para o outro dev
1. Preço por cliente: hoje existe em dois lugares (tabela de preços e `precosPorCliente`
   do produto) com valores diferentes. Qual é a fonte única?
2. O pedido vem com nome/documento/cidade do cliente, ou só `clienteId`?
3. Os ids são números ou códigos (UUID)?
4. Quais status existem para pedido e pré-cadastro? (front: Em análise, Aprovado,
   Recusado, Faturado / Aguardando análise, Em revisão, Documentação pendente, Aprovado, Recusado)
5. Quem calcula total, desconto e volumes do pedido: front ou backend?
6. Login (fica por último): como vai ser a autenticação (token, sessão)?