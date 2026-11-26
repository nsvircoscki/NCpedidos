import express, { type NextFunction, type Request, type Response } from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { rotas } from './rotas.js';

// O Angular compilado (npx ng build, na raiz do projeto). O servidor roda de dentro de server/.
const PASTA_SITE = resolve(process.env['PASTA_SITE'] ?? '../dist/sistema-pedidos/browser');
const PORTA = Number(process.env['PORTA'] ?? process.env['PORT'] ?? 3000);

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));
app.use('/api', rotas);
app.use('/api', (_req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada.' });
});

if (existsSync(PASTA_SITE)) {
    app.use(express.static(PASTA_SITE));
    // Rotas do Angular (/login, /...) abrem o index.html; quem decide a tela é o router do front.
    app.get('/{*caminho}', (_req, res) => res.sendFile('index.csr.html', { root: PASTA_SITE }));
}

app.use((erro: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente de novo.' });
});

app.listen(PORTA, () => console.log(`Servidor em http://localhost:${PORTA}`));
