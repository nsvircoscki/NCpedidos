# Servidor do pedido rápido (MVP)

API em Node (Express) + PostgreSQL. O mesmo servidor entrega o Angular compilado, então o sistema
inteiro fica em uma URL só.

## Variáveis de ambiente

Copie `.env.example` para `.env` (o `.env` não vai para o git).

| Variável | O que é |
| --- | --- |
| `DATABASE_URL` | Conexão do Postgres. Local: a do `.env.example`. Neon: a URL deles, com `?sslmode=require` |
| `JWT_SEGREDO` | Texto longo e aleatório que assina o login. Trocar desconecta todo mundo |
| `PORTA` | Porta local (no Render, ele usa `PORT` sozinho) |

## Rodar no computador

```bash
cd server
npm install
docker compose up -d          # Postgres local na porta 5433
npm run migrar                # cria/atualiza as tabelas
npm run criar-representante -- --nome "Seu nome" --email voce@nctintas.com.br --admin
npm run importar-tabelas -- --email narciso@nctintas.com.br --pasta ../narciso
npm run dev                   # API em http://localhost:3000
```

No outro terminal, na raiz do projeto: `npx ng serve` (o `proxy.conf.json` manda `/api` para a porta 3000).
Para testar como em produção: `npx ng build` na raiz e abrir `http://localhost:3000`.

## Usuários e tabelas

- **Usuários**: o admin cadastra pela tela **Usuários** (botão no topo do pedido). O script
  `criar-representante` serve para o primeiro admin e para trocar a senha de alguém
  (rodar de novo com o mesmo e-mail).
- **Tabelas dos clientes**: uma planilha "Tabela de Preço" do ERP por cliente, numa pasta por
  representante. `importar-tabelas` cria ou atualiza os clientes (pelo código da tabela) e troca os
  produtos de cada um. Ignora `aaa`, `ERRADO` e planilhas sem produto. O representante precisa existir antes.
- As planilhas têm preços reais: ficam fora do git (`.gitignore`).

## Publicar (Render + Neon)

1. **Neon** (neon.tech): crie um projeto Postgres e copie a *connection string*.
2. No computador, com essa URL no `DATABASE_URL` do `.env`: `npm run migrar`, crie o admin e importe as tabelas.
3. **Render** (render.com): *New → Web Service*, ligado ao repositório, branch `mvp/pedido-pdf`.
   - Build command: `npm ci && npx ng build && cd server && npm ci --include=dev && npm run build`
   - Start command: `cd server && npm start`
   - Environment: `DATABASE_URL`, `JWT_SEGREDO` e `PASTA_SITE=../dist/sistema-pedidos/browser`.
   - Use um plano pago (o gratuito "dorme" e o primeiro acesso demora).
4. Abra a URL do Render no celular e entre com o admin.

## Testes

`npm test` (leitura da planilha, com `node:test`).
