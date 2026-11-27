import express, { type NextFunction, type Request, type Response } from 'express';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { apagarRegistrosAntigos } from './auditoria.js';
import { rotas } from './rotas.js';

// O Angular compilado (npx ng build, na raiz do projeto). O servidor roda de dentro de server/.
const PASTA_SITE = resolve(process.env['PASTA_SITE'] ?? '../dist/sistema-pedidos/browser');
const INDEX = 'index.csr.html';
const PORTA = Number(process.env['PORTA'] ?? process.env['PORT'] ?? 3000);
const UM_DIA_MS = 24 * 60 * 60 * 1000;

const app = express();
// Quantos proxies ficam na frente (Render = 1; Cloudflare + Render = 2): é assim que o req.ip vira o IP de quem
// acessou, e não o do proxy. Com o número errado, o limite de tentativas por endereço não funciona.
app.set('trust proxy', Number(process.env['PROXIES'] ?? 1));
app.disable('x-powered-by');
const politica = politicaDeSeguranca(resolve(PASTA_SITE, INDEX));
app.use((_req, res, next) => {
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'Content-Security-Policy': politica,
        'Strict-Transport-Security': 'max-age=31536000',
    });
    next();
});
app.use(express.json({ limit: '20kb' }));
// Respostas da API têm dados de clientes: o navegador e proxies não guardam cópia.
app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});
// A sessão vai no cookie, que o navegador manda sozinho: pedido que muda dados só vale vindo deste site.
// O SameSite=Strict do cookie já barra; isto é a segunda proteção (contra CSRF).
app.use('/api', (req, res, next) => {
    const origem = req.get('origin');
    if (req.method === 'GET' || !origem || origem === `${req.protocol}://${req.get('host')}`) {
        next();
        return;
    }
    res.status(403).json({ erro: 'Origem não permitida.' });
});
app.use('/api', rotas);
app.use('/api', (_req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada.' });
});

if (existsSync(PASTA_SITE)) {
    app.use(express.static(PASTA_SITE));
    // Rotas do Angular (/login, /...) abrem o index.html; quem decide a tela é o router do front.
    app.get('/{*caminho}', (_req, res) => res.sendFile(INDEX, { root: PASTA_SITE }));
}

app.use((erro: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente de novo.' });
});

const limparAuditoria = () => apagarRegistrosAntigos().catch(erro => console.error(erro));
limparAuditoria();
setInterval(limparAuditoria, UM_DIA_MS);

app.listen(PORTA, () => console.log(`Servidor em http://localhost:${PORTA}`));

/**
 * Content-Security-Policy: o navegador só roda código vindo deste servidor, e ninguém abre o sistema dentro de um
 * iframe de outro site. O index.html tem um script embutido (o do Angular que liga o CSS): ele entra pelo hash,
 * calculado do arquivo compilado, para continuar valendo a cada build.
 */
function politicaDeSeguranca(index: string): string {
    const embutidos = existsSync(index) ? readFileSync(index, 'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g) : [];
    const hashes = [...embutidos].map(([, codigo]) => `'sha256-${createHash('sha256').update(codigo).digest('base64')}'`);
    return [
        "default-src 'self'",
        `script-src 'self' ${hashes.join(' ')}`.trim(),
        // O Angular põe o CSS de cada componente em <style>: sem 'unsafe-inline' as telas perdem o estilo.
        "style-src 'self' 'unsafe-inline'",
        // A fonte Manrope vem do Google Fonts (src/styles.scss).
        "font-src 'self' https://fonts.gstatic.com",
        // data: e blob: são o logo e o PDF gerados no navegador.
        "img-src 'self' data: blob:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
    ].join('; ');
}
