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
- **Filtros desktop** (`src/app/components/filtro-modal/`): `app-filtro-modal` (botão hambúrguer
  + modal com pop-in e gelatina, conteúdo por `ng-content`) e `app-filtro-chips` (grupo de chips).
  Usados em clientes, produtos, tabela de preços e pedidos. Os filtros mobile continuam com a gaveta própria.
- **Dashboard**: lista e contadores vêm de `PEDIDOS_EXEMPLO` (`src/app/data/pedidos.ts`).
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

- Revisar o modo escuro tela por tela no navegador e ajustar cores que ficaram estranhas.

- Testar no navegador o modal de filtros compartilhado nas 4 telas (pop-in, gelatina, chips, contador).
- `PedidoAcompanhamentoComponent` não é usado (aviso NG8113 no build).
- Detalhe do pedido (`pedido-enviado`) mostra sempre os dados mock do 1047; só o número vem da rota.
- Item 3 da revisão de design (identidade visual mais marcante: fonte, cores de tinta) vai ser feito na branch `design/identidade-visual`, depois que o trabalho atual for commitado no main.
- Login (por último).

## Histórico

- 2026-11-12: cartões padronizados com a utility `cartao` (31 blocos; antes misturavam
  rounded-xl, 2xl, 14px e 20px e sombras próprias). 105 textos em slate-400 e cinzas parecidos
  passaram para slate-500 (+ `dark:text-noite-suave`) para atingir contraste AA. Backup do src
  antes da mudança em `%TEMP%/bk_cartoes`. Build ok; não verificado no navegador. (Claude)

- 2026-11-12: tipografia padronizada nas telas com `sobretitulo`, `titulo-pagina`,
  `subtitulo-pagina` e `titulo-secao` (antes havia títulos de 30, 32, 3xl e 2xl e quatro tons de
  preto). Subtítulo passou de slate-400 para #64748b para atingir contraste AA. (Claude)

- 2026-11-12: detalhe do pedido: itens em uma coluna só no desktop; abas Resumo/Acompanhamento maiores no desktop; botão Ver acompanhamento/resumo com `botao-acao`, largura total e mais alto. (Claude)

- 2026-11-12: seletor de cliente único (`SeletorClienteComponent`) no Novo pedido e em Produtos,
  com documento e localização (bairro, cidade - UF); lista comum em `data/clientes.ts`.
  Botões de ação padronizados com `botao-acao` / `botao-acao-secundario` (visual do "Novo pedido"
  da Visão geral) em dashboard, pedidos, produtos, clientes, tabela de preços, cadastro e detalhe
  de produto e Enviar pedido. Build ok; não verificado no navegador. (Claude)

- 2026-11-12: pedidos do dashboard abrem os detalhes (`/pedidos/:id`), no mobile (link no item) e no desktop (linha clicável + link no número). (Claude)

- 2026-11-12: modo escuro trocado de azul-marinho para cinza carvão (só os tokens `noite-*` em `styles.scss`; o azul `noite-marca` foi mantido). (Claude)

- 2026-11-12: filtros do desktop de clientes, produtos, tabela de preços e pedidos agora usam o
  mesmo modal hambúrguer com pop-in (`FiltroModalComponent` + `FiltroChipsComponent`). O código
  da gelatina saiu da tabela de clientes e foi para o componente. Dashboard mostra os pedidos de
  exemplo. Build ok; não verificado no navegador. (Claude)

- 2026-11-12: cadastro de cliente com uma barra de progresso só (desktop e mobile, a partir de
  `etapas` no TS), header mobile único com `voltar()`, uma instância de cada formulário.
  Corrigido o Voltar das observações (saía do cadastro e tinha texto de 5px). (Claude)

- 2026-11-12: pré-cadastro de cliente pergunta PJ ou PF antes do formulário
  (EscolhaTipoClienteComponent). O formulário recebe o tipo por input e não deixa trocar;
  no mobile, o Voltar retorna à pergunta. Trocar o tipo apaga os campos do outro tipo. (Claude)

- 2026-11-12: mobile do cadastro de cliente padronizado com o Novo pedido (header com etapa,
  seletor PJ/PF no estilo das abas, labels 10px, campos com fundo branco, rodapé legível e
  Voltar funcionando). Não verificado no navegador. (Claude)

- 2026-11-12: troca de tema com animação (View Transitions: círculo que cresce a partir do
  botão sol/lua). Logo sem o "20 anos": `public/assets/logo-nc-tintas.svg` (recorte do
  logoLogin.svg via viewBox), usado na sidebar, no header mobile e no login. (Claude)

- 2026-11-12: modo escuro no sistema inteiro. TemaService + botão sol/lua no top-header e
  no mobile-header. Classes `dark:` geradas por script em todos os templates a partir das cores
  claras; tokens `noite-*` em `styles.scss`. Ainda não revisado tela por tela no navegador. (Claude)

- 2026-11-12: botões de criar (Novo pedido, Novo cliente, Cadastrar produto, Adicionar...)
  ganharam pop ao pressionar com a classe global `.botao-pop` em `styles.scss`. Para um botão
  novo de criar, basta adicionar `botao-pop` no class. (Claude)

- 2026-11-12: pesquisa do top-header no estilo do site do Tailwind (Ctrl+K/⌘K, Esc, setas,
  lista em `src/app/data/funcionalidades.ts`), escrita por quem desenvolve. Botão "Pesquisar"
  ganhou slide up text no hover (`animate-subir-letra` em `styles.scss`, letras com máscara
  `overflow-hidden`) e borda fina no lugar do fundo escuro. O modal de pesquisa abre com
  slide up em sequência (`animate-surgir-fundo` e `animate-subir`). Blur reveal foi testado
  e trocado a pedido. (Claude)

- 2026-11-12: modal de filtros da tabela de clientes fixo no centro; shake removido.
  Criados `AGENTS.md` (regras únicas), `CLAUDE.md` importando `AGENTS.md` e este caderno. (Claude)
