# NC Pedidos - Dashboard Comercial

O NC Pedidos e um painel de controle comercial desenvolvido para gerenciamento, acompanhamento e visualizacao de pedidos, metricas de vendas e dados operacionais.

---

## Tecnologias Utilizadas

- Front-end: Angular
- Estilizacao: Tailwind CSS, HTML5, CSS3 / SCSS
- Linguagem: TypeScript
- Design e Prototipacao: Figma

---

## Funcionalidades Principais

- Painel de Metricas: Visualizacao clara dos indicadores gerais de desempenho e vendas.
- Tabela e Gestao de Pedidos: Acompanhamento do status, detalhes e dados dos pedidos cadastrados.
- Interface Responsiva: Layout moderno e adaptado para navegacao fluida construida com Tailwind CSS.

---

## Estrutura do Projeto

```text
NCpedidos/
├── src/
│   ├── app/
│   │   ├── components/    # Componentes reutilizaveis (tabelas, cards, filtros)
│   │   ├── pages/         # Paginas do dashboard
│   │   ├── services/      # Servicos de integracao de dados / APIs
│   │   └── models/        # Interfaces e modelos de dados
│   ├── assets/            # Imagens, icones e recursos estaticos
│   └── styles.scss        # Estilos globais e diretivas do Tailwind CSS
├── tailwind.config.js     # Configuracao das classes e tema do Tailwind CSS
└── package.json