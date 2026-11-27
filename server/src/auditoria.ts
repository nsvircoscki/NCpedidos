import type { Request, Response } from 'express';
import { banco } from './banco.js';

/** Grava quem fez (`res.locals` do `exigirLogin`), o quê, e de onde. */
export async function registrar(req: Request, res: Response, acao: string, detalhe = ''): Promise<void> {
    await banco.query(
        'insert into auditoria (usuario_id, usuario, acao, detalhe, ip) values ($1, $2, $3, $4, $5)',
        [res.locals['representanteId'] ?? null, String(res.locals['usuario'] ?? '').slice(0, 60), acao, detalhe.slice(0, 300), req.ip ?? ''],
    );
}

// O IP é dado pessoal (LGPD): o registro fica só pelo tempo necessário para investigar um problema (1 ano).
export async function apagarRegistrosAntigos(): Promise<void> {
    await banco.query("delete from auditoria where quando < now() - interval '1 year'");
}
