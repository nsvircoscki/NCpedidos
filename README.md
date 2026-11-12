# NC Pedidos

Sistema de pedidos da NC Tintas para representantes de vendas. Reúne pedidos, clientes,
produtos e tabelas de preço em um só lugar, no computador e no celular.

> **Status:** em desenvolvimento. Os dados ainda são de exemplo (sem backend) e o login
> ainda não funciona; ele será feito por último.

---

## Funcionalidades

- **Visão geral:** cartões com os números dos pedidos (que podem ser reordenados arrastando) e pedidos recentes.
- **Pedidos:**
  - lista com busca e filtro por status (Em análise, Aprovado, Recusado, Faturado);
  - detalhe do pedido com resumo e acompanhamento.
- **Novo pedido:** escolha do cliente, itens, condição de pagamento, previsão de entrega e observação.
- **Aprovação de pedidos:** fila dos pedidos em análise; cada pedido pode ser aprovado ou recusado (a recusa exige um motivo).
- **PDF do pedido:** comprovante com a logo da NC Tintas, que pode ser enviado ao cliente
  (no celular abre a opção de compartilhar, como no WhatsApp) ou baixado.
- **Clientes:**
  - lista com filtros e ordenação;
  - pré-cadastro (PF e PJ);
  - análise dos pré-cadastros, com exportação da lista em CSV.
- **Produtos e preços:** catálogo, cadastro e edição de produtos, além da tabela de preços de cada cliente.
- **Configurações:** tema claro, escuro ou igual ao do sistema.
- **Busca rápida:** `Ctrl+K` abre a busca para ir direto a qualquer tela.

---

## Tecnologias

- [Angular 22](https://angular.dev): componentes standalone, signals e rotas com carregamento sob demanda (lazy)
- [Tailwind CSS 4](https://tailwindcss.com): estilos e modo escuro
- [ng-motion](https://www.npmjs.com/package/@scripttype/ng-motion): animações
- [jsPDF](https://github.com/parallax/jsPDF): geração do PDF dos pedidos
- TypeScript, SCSS e Figma (protótipos)

---

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org) 20 ou mais recente.

```bash
npm install --legacy-peer-deps
npx ng serve
```

Depois abra `http://localhost:4200`.

- O `--legacy-peer-deps` é necessário porque o ng-motion 0.5.0 ainda declara compatibilidade
  só com o Angular 21.
- Se você criar uma tela ou rota nova e ela não aparecer, reinicie o `ng serve`.

Para gerar a versão de produção: `npx ng build` (o resultado fica em `dist/`).

---

## Estrutura do projeto

```text
src/
├── app/
│   ├── pages/        # Telas com rota própria (registradas em app.routes.ts)
│   ├── components/   # Peças reutilizáveis usadas dentro das telas
│   ├── layout/       # Sidebar, cabeçalhos e navegação do celular
│   ├── services/     # Dados compartilhados (PedidosStore), PDF e tema
│   ├── models/       # Interfaces dos dados
│   ├── data/         # Dados de exemplo (pedidos, clientes, pré-cadastros)
│   └── app.routes.ts # Rotas do sistema
├── index.html
└── styles.scss       # Tailwind, cores do tema e classes padrão (botões, cartões, títulos)
public/assets/        # Logos, ícones e imagens
docs/PROGRESSO.md     # Estado atual do projeto e pendências
AGENTS.md             # Regras do projeto para quem desenvolve e para agentes de IA
```

---

## Padrões do projeto

As regras de código e de visual (botões, cartões, modo escuro, campos com label flutuante)
ficam em [`AGENTS.md`](AGENTS.md). O que já foi feito e o que falta fica em
[`docs/PROGRESSO.md`](docs/PROGRESSO.md).
