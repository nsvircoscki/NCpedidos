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
| `NODE_ENV` | `production` no servidor: aí o `JWT_SEGREDO` precisa ter 32+ caracteres, senão nem sobe |

## Rodar no computador

```bash
cd server
npm install
docker compose up -d          # Postgres local na porta 5433
npm run migrar                # cria/atualiza as tabelas
npm run criar-representante -- --nome "Seu nome" --usuario seunome --admin
npm run importar-erp          # clientes, tabelas e usuários dos representantes
npm run novas-senhas          # senha nova (padrão NcRafael4821) para os representantes
npm run dev                   # API em http://localhost:3000
```

No outro terminal, na raiz do projeto: `npx ng serve` (o `proxy.conf.json` manda `/api` para a porta 3000).
Para testar como em produção: `npx ng build` na raiz e abrir `http://localhost:3000`.

## Usuários e clientes

- **Usuários**: o login é o nome de usuário (`rafael`), não o e-mail. O admin cadastra, edita e exclui pela tela
  **Usuários** (botão no topo do pedido). O script `criar-representante` serve para o primeiro admin e para
  trocar a senha de alguém (rodar de novo com o mesmo usuário).
- **Telas do admin** (abas Usuários, Clientes e Tabelas): na Clientes, cadastra, edita (tabela, representante),
  passa para outro representante e inativa ou reativa clientes (inativo some do pedido, mas não é apagado); na Tabelas, tira e põe produtos numa tabela (vale para todos
  os clientes dela). O que o admin muda ganha data de edição (`editado_em`, `editada_em`) e a importação não desfaz (nem reativa um inativo).
- **Clientes de cada representante** (`importar-erp`): lê `../INFORMAÇÕES/Clientes 12 meses - importação.xlsx`,
  exportada do ERP Bem-Empresa (outro caminho: `--planilha`), com as abas Clientes, Tabelas e Produtos da tabela.
  - Clientes: os que compraram nos últimos 12 meses, do representante do **cadastro**, ligados pelo **código** do
    representante no ERP (`PRI-65`, guardado em `representantes_erp`). Uma pessoa tem vários códigos (um por base e
    por comissão): "5 - RAFAEL BENEDET" e "RAFAEL BENEDET" são o mesmo usuário. Ficam de fora o cliente bloqueado
    e os de INATIVO, DIRETO ou sem representante.
  - Representante sem usuário ganha um: login pelo primeiro nome sem acento (`rafael`); quem divide o primeiro
    nome usa o nome inteiro com ponto (`wilson.sp`). A senha segue o padrão da empresa, Nc + primeiro nome + 4 números
    (`NcRafael4821`, `src/senhas.ts`), e vai para `senhas-novos-usuarios.txt` (fora do git): passe a cada um e
    apague o arquivo. `npm run novas-senhas` troca de novo a de todos os representantes (`-- --usuario rafael`, só um).
  - A tabela do cliente é a do cadastro. Sem tabela (ou com uma sem nome ou sem produtos), fica com a RECEPCAO
    (código 500) da mesma base; a base que não tem RECEPCAO usa a `PRI-500`.
  - Códigos levam a sigla da base: `PRI` (Principal), `MG` (Minas), `AST` (Asterisco), `MGA` (Minas Asterisco).
  - Tabelas e itens valem para todos os representantes. Todas as tabelas vão para `tabelas_erp`.
  - Produto com nomes diferentes: vale o de uma tabela da Principal; sem Principal, o primeiro que aparece.
  - Rodar de novo atualiza sem duplicar, apaga os clientes que saíram da planilha e não mexe no que o admin editou.
  - No fim mostra os clientes por usuário, os usuários novos, quem ficou com a RECEPCAO e quem ficou de fora.
- As planilhas têm dados reais: ficam fora do git.

## Segurança

- Todo SQL usa parâmetros (`$1`, `$2`): o texto digitado nunca vira comando. Não monte SQL com `${...}`.
- O banco não fica exposto: só o servidor conhece o `DATABASE_URL`. No Neon, use a senha gerada por eles,
  `?sslmode=require` e, se o plano permitir, **IP Allow** com o IP de saída do Render. Não publique a URL.
- O Postgres local (`docker compose`) só aceita conexão da própria máquina (`127.0.0.1:5433`).
- Login: bcrypt e sessão de 12 h num cookie HttpOnly, Secure e SameSite=Strict (o JavaScript não lê, então um
  script malicioso não rouba a sessão), com checagem de `Origin` contra CSRF. Em 15 min, no máximo 10 tentativas erradas por endereço e 5 por usuário
  (`src/tentativas.ts`), para quem tenta de vários endereços. Senha de 8 a 72 caracteres.
- Senha dada pelo admin, pela importação ou pelo `novas-senhas` é provisória (`trocar_senha`): no primeiro login
  a pessoa cria a sua, sem o nome de usuário, e até lá a API só aceita a troca de senha (`PUT /auth/senha`).
- A cada chamada o servidor confere no banco se o usuário existe, se é admin e se a sessão é de depois da
  última troca de senha (`sessao_desde`): excluir, trocar a senha ou tirar o admin vale na hora.
- Verificação em duas etapas (código de 6 números do Google ou Microsoft Authenticator, `src/totp.ts`):
  obrigatória para o admin (sem ela, as rotas de admin dão 403) e opcional para os representantes, na tela
  Minha conta. O segredo fica cifrado no banco (AES-256-GCM, chave derivada do `JWT_SEGREDO`, `src/cifra.ts`), e
  cada código vale uma vez só. Perdeu o celular: o admin redefine a senha, o que desliga a verificação. O admin que
  perder o celular roda `npm run criar-representante` com o usuário dele (redefine a senha e desliga também).
  Trocar o `JWT_SEGREDO` obriga todo mundo a ativar de novo.
- Rotas de usuários exigem admin. O admin não pode tirar o próprio admin nem se excluir.
- Usuário excluído não volta na importação do ERP, nem os clientes dele (migração 008).
- Registro de auditoria (tabela `auditoria`, tela Registro do admin): logins, logins recusados, trocas de senha e
  tudo que o admin muda, com usuário, data e IP. Fica 1 ano (o IP é dado pessoal) e o servidor apaga o resto.
- Content-Security-Policy (`src/servidor.ts`): o navegador só roda scripts deste servidor. O script embutido do
  `index.html` entra pelo hash, calculado do build quando o servidor sobe. Fonte só do Google Fonts.
- O servidor manda também `nosniff`, HSTS e `Cache-Control: no-store` na API.
- O site não entrega arquivos de fora do `dist/` (`/server/.env` abre a página do Angular, não o arquivo).

### Dependências (ataques pela cadeia do npm)

- Instalar sempre com `npm ci`: baixa exatamente o que está no `package-lock.json`, sem atualizar nada sozinho.
  `npm install` só para pacote novo, conferindo antes o nome (pacotes falsos imitam nomes conhecidos).
- `.github/workflows/seguranca.yml` roda `npm audit` a cada push e toda segunda-feira; na mão:
  `npm audit --omit=dev` na raiz e em `server/`. Com falha "high" ou pior, atualizar o pacote e testar.

### Banco com o mínimo de permissão

O servidor no Render não precisa criar nem apagar tabelas, só ler e gravar dados. No Neon:
1. Crie o papel `pedidos_app` (*Roles → New role*) e guarde a senha.
2. No *SQL Editor*, com o usuário dono do banco:
   ```sql
   grant usage on schema public to pedidos_app;
   grant select, insert, update, delete on all tables in schema public to pedidos_app;
   grant usage on all sequences in schema public to pedidos_app;
   -- tabelas criadas por migrações futuras já nascem com a mesma permissão
   alter default privileges in schema public grant select, insert, update, delete on tables to pedidos_app;
   alter default privileges in schema public grant usage on sequences to pedidos_app;
   ```
3. No Render, o `DATABASE_URL` usa o `pedidos_app`. Migrações e importação rodam do seu computador com o dono.

Assim, uma falha no servidor não deixa ninguém apagar tabelas ou mexer na estrutura do banco.

### Backup

O Neon guarda o histórico do banco e restaura um momento anterior (*Restore*); o tempo guardado depende do plano.
Além disso, faça uma cópia por semana, de dentro de `server/` (crie antes a pasta `backups`), com o `DATABASE_URL`
do dono no ambiente (não digite a URL no comando):
```
docker run --rm -e DATABASE_URL postgres:17 sh -c 'pg_dump "$DATABASE_URL"' > backups/pedidos-AAAA-MM-DD.sql
```
A pasta `backups/` fica fora do git: o arquivo tem dados de clientes. Guarde em lugar com acesso restrito.

### Hospedagem

No Render, servidor, portas, firewall e certificado HTTPS são deles: só a porta do app fica aberta e o tráfego
já chega criptografado. Com domínio próprio, dá para pôr o Cloudflare (plano gratuito) na frente, para barrar
robôs e varreduras. Servidor próprio (VPS) pediria o resto: usuário sem permissões para rodar o app,
firewall com só as portas 80/443, e túnel do Cloudflare.

## Publicar (Render + Neon + Cloudflare, domínio nctintaspedidos)

1. **Neon** (neon.tech): crie um projeto Postgres e copie a *connection string*.
2. No computador, com essa URL no `DATABASE_URL` do `.env`: `npm run migrar`, crie o admin e importe os clientes.
3. **Render** (render.com): *New → Web Service*, ligado ao repositório, branch `mvp/pedido-pdf`.
   - Build command: `npm ci && npx ng build && cd server && npm ci --include=dev && npm run build`
   - Start command: `cd server && npm start`
   - Environment: `DATABASE_URL`, `JWT_SEGREDO` (gerado com o comando do `.env.example`), `NODE_ENV=production`
     e `PASTA_SITE=../dist/sistema-pedidos/browser`.
   - Use um plano pago (o gratuito "dorme" e o primeiro acesso demora).
4. **Domínio**: registre `nctintaspedidos.com.br` no Registro.br.
5. **Cloudflare** (plano gratuito): adicione o domínio e troque os DNS no Registro.br pelos do Cloudflare.
   - No Render, *Settings → Custom Domains*: adicione `nctintaspedidos.com.br` e crie no Cloudflare o registro
     CNAME que o Render pedir, com a nuvem laranja (proxy) ligada.
   - Cloudflare *SSL/TLS*: modo **Full (strict)** e *Always Use HTTPS*. *Security*: *Bot Fight Mode* ligado.
   - No Render, adicione a variável `PROXIES=2` (Cloudflare + Render), senão o limite de tentativas por endereço
     enxerga o IP do Cloudflare em vez do de quem acessa.
6. Abra o site no celular, entre com o admin e ative a verificação em duas etapas (Minha conta, ícone da chave).
7. **Verificação em duas etapas nas contas** de GitHub, Render, Neon, Cloudflare e Registro.br: quem invade uma
   delas leva o sistema inteiro, por melhor que seja o código.

## Testes

`npm test` (leitura das planilhas do ERP, com `node:test`).
