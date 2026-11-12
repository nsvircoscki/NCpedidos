# Progresso do projeto

Caderno de passagem de turno entre agentes (Claude Code, Codex...). Leia ao começar e
atualize ao terminar cada tarefa. As regras ficam em `AGENTS.md`; aqui fica só o estado do trabalho.

## Estado atual

- **Rotas** (`src/app/app.routes.ts`): todas com `loadComponent` (lazy), agrupadas em
  `pedidos/`, `produtos/` e `clientes/`. Qualquer rota desconhecida (`**`) vai para o dashboard.
  "Pedido enviado" e "Acompanhamento" usam o pedido de exemplo 1047.
- **Layout** (`src/app/layout/`): `LayoutComponent` envolve as telas internas com sidebar,
  headers e navegação mobile. As páginas não importam mais esses componentes.
- **Pedido enviado**: movido de `components/pedido-enviado` para `pages/pedido-enviado`.
- **Inputs com label flutuante**: classes `.label-input*` em `src/styles.scss` (só no desktop).
- **Dashboard**: os cards podem ser reordenados arrastando (ng-motion drag + layout).
- **Produtos**: o seletor de cliente abre como modal com animação pop-in.
- **Clientes** (`src/app/components/clientes/clientes-table.component.*`):
  - ordenação por nome, data de cadastro, última compra e total comprado;
  - botão hambúrguer abre um modal de filtros (tipo, status, cidade) e ordenação;
  - o modal abre com pop-in, pode ser puxado para os lados com efeito gelatina
    (giro, inclinação e esticar guiados pela velocidade do arrasto) e volta ao centro ao soltar
    (`dragSnapToOrigin`). Os limites (`limitesArrasto`) impedem que ele saia da tela;
  - no mobile, o modal de opções também abre com pop-in.
- **Login**: ainda não funciona. Fica por último, por decisão de quem desenvolve.
- Todos os dados são mock (sem backend).

## Pendências

- Testar no navegador o modal de filtros da tabela de clientes (gelatina e volta ao centro).
- `PedidoAcompanhamentoComponent` não é usado (aviso NG8113 no build).
- Login (por último).

## Histórico

- 2026-11-12: modal de filtros da tabela de clientes fixo no centro; shake removido.
  Criados `AGENTS.md` (regras únicas), `CLAUDE.md` importando `AGENTS.md` e este caderno. (Claude)
