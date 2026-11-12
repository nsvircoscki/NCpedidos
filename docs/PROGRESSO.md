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
- **Inputs com label flutuante**: classes `.label-input*` em `src/styles.scss`, em todos os campos de texto
  (desktop e celular), inclusive buscas. Exceções: busca Ctrl+K e o campo de data escondido do Novo pedido.
- **Dashboard**: os cards podem ser reordenados arrastando (ng-motion drag + layout).
- **Produtos**: o seletor de cliente abre como modal com animação pop-in.
- **Filtros desktop** (`src/app/components/filtro-modal/`): `app-filtro-modal` (botão hambúrguer
  + modal com pop-in e gelatina, conteúdo por `ng-content`) e `app-filtro-chips` (grupo de chips).
  Usados em clientes, produtos, tabela de preços e pedidos. Os filtros mobile continuam com a gaveta própria.
- **Pedidos**: a lista fica no `PedidosStore` (`services/pedidos-store.ts`), iniciada com
  `PEDIDOS_EXEMPLO` (`data/pedidos.ts`, agora com itens, condições e representante). Pedidos,
  dashboard, detalhe (`/pedidos/:id`), Novo pedido e Aprovação leem dele. Status:
  Em análise, Aprovado, Recusado, Faturado. Nada é salvo: ao recarregar a página volta ao mock.
- **Aprovação de pedidos**: `/pedidos/aprovacao` (fila, filtros, resumo) e `/pedidos/aprovacao/:id`
  (detalhe com Aprovar e Recusar com motivo obrigatório). Acesso pelo botão em Pedidos e pelo Ctrl+K.
- **PDF do pedido** (`services/pedido-pdf.ts`, jsPDF 4.2.1): botões "Enviar PDF" e "Baixar PDF" no
  Novo pedido (depois de enviar), no detalhe do pedido e na aprovação.
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
- Testar no navegador o PDF (download no computador, compartilhar no celular) e a aprovação.
- A aba Acompanhamento do detalhe do pedido ainda usa dados fixos.
- Item 3 da revisão de design (identidade visual mais marcante: fonte, cores de tinta) vai ser feito na branch `design/identidade-visual`, depois que o trabalho atual for commitado no main.
- Botões Aprovar/Recusar da análise ainda só mudam o status na tela (não atualizam a lista).
- Conferir no celular se algum card ficou apertado depois do piso de 11px (produtos, tabela de preços, clientes).
- Login (por último).

## Histórico

- 2026-11-12: logo da NC Tintas no topo do PDF do pedido (a mesma `assets/logo-nc-tintas.svg` da
  sidebar, desenhada num canvas e embutida como JPEG). O topo do PDF ficou branco com uma faixa azul,
  porque a logo é azul e vermelha. Testado no Edge headless: a logo aparece e o PDF tem ~35 KB. (Claude)

- 2026-11-12: botão "Baixar PDF" ao lado de "Enviar PDF" (`PedidoPdfService.baixar`). Se a fila de
  aprovação aparecer vazia ou "Pedido #aprovacao não encontrado", reinicie o `ng serve` (ele não
  pegou as rotas novas). (Claude)

- 2026-11-12: PDF do pedido para o cliente (jsPDF, compartilhar no celular ou baixar) e tela de
  aprovação de pedidos (`pages/aprovacao-pedidos`, `pages/aprovar-pedido`). Criado o
  `PedidosStore`; detalhe do pedido passou a mostrar os dados reais do pedido; CSS do
  `status-pill` (antes não existia). Build ok, não verificado no navegador. (Claude)

- 2026-11-12: `autocomplete="off"` em 60 campos (todos menos o login) para o navegador não sugerir endereços e textos já digitados. (Claude)

- 2026-11-12: label flutuante (`label-input`) em todos os campos de digitar, inclusive buscas, e
  agora também no celular. No celular o texto digitado tem 16px (evita o zoom do iPhone). Label em
  repouso passou para #64748b (contraste AA). Backup do src em `%TEMP%/bk_labels`. (Claude)

- 2026-11-12: revisão do mobile: 87 textos de 6 a 9px passaram para 11px (piso de leitura);
  topo das telas no celular padronizado (sobretítulo com a área, data real no dashboard em vez de
  "TERÇA-FEIRA, 17 DE SETEMBRO" fixo, sem "OLÁ, RAFAEL", subtítulo com `subtitulo-pagina`).
  Backup do src antes em `%TEMP%/bk_mobile`. Não verificado no navegador. (Claude)

- 2026-11-12: `AmostraTintaComponent` (`components/amostra-tinta/`) com o cartão de amostra de
  tinta, usado no dashboard e no resumo da Análise de clientes. Página de análise com botão
  voltar quadrado (padrão do detalhe do pedido) e conteúdo alinhado ao cabeçalho. (Claude)

- 2026-11-12: Produtos (desktop): botão Cadastrar produto na mesma linha do título, como em Pedidos e Clientes, e menos espaço antes do seletor de cliente. (Claude)

- 2026-11-12: seletor de cliente mais compacto no celular (título menor, avatar 40px, sem documento) e, em Produtos, sem a caixa branca em volta no celular (`lg:cartao`). (Claude)

- 2026-11-12: lista de análise de clientes (`pages/analise-clientes/`, rota `/clientes/analise`):
  resumo da fila, filtro por status, tabela no desktop e lista no celular, exportar CSV. Cada linha
  abre `/clientes/analise/:id`, que agora mostra os dados do pré-cadastro (mock em
  `data/pre-cadastros.ts`). Amostras do dashboard voltaram a ter os ícones. (Claude)

- 2026-11-12: vermelho do logo (#ea1b25) virou o token `nc-vermelho`. Foi testado na navegação
  ativa e nos contadores e removido (não aprovado); fica só no login, num traço sob o "Entrar". (Claude)

- 2026-11-12: cartões do dashboard como amostras de tinta (tokens `tinta-*`). Segoe UI foi
  testada e descartada; a fonte continua Manrope.
  Build ok; não verificado no navegador. (Claude)

- 2026-11-12: branch `design/identidade-visual` descartada (fontes novas e cartões-amostra não
  aprovados; a Manrope fica). Títulos alinhados no main: título de página no celular com 26px e
  nova `titulo-cartao` (16px negrito) em cartões e modais. (Claude)

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
