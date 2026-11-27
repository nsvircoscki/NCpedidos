import { randomInt } from 'node:crypto';
import { semAcento } from './planilha.js';

/**
 * Senha provisória no padrão da empresa: "Nc" + primeiro nome + 4 números ("NcRafael4821"), fácil de ditar.
 * É previsível de propósito: vale só até o primeiro login, quando a pessoa cria a sua.
 */
export function senhaDaEmpresa(nome: string): string {
    const [primeiro = ''] = semAcento(nome).replace(/[^A-Za-z0-9 ]/g, '').trim().split(/\s+/);
    const numero = String(randomInt(10000)).padStart(4, '0');
    return `Nc${primeiro.charAt(0).toUpperCase()}${primeiro.slice(1).toLowerCase()}${numero}`;
}

export const MENSAGEM_SENHA = 'A senha precisa ter de 8 a 72 caracteres.';

export function senhaValida(senha: unknown): senha is string {
    // O bcrypt só considera os primeiros 72 bytes: acima disso, parte da senha seria ignorada sem aviso.
    return typeof senha === 'string' && senha.length >= 8 && Buffer.byteLength(senha) <= 72;
}

/** Senha que a própria pessoa escolhe: o motivo de recusar, ou null se está boa. */
export function problemaNaSenhaNova(nova: unknown, atual: string, usuario: string): string | null {
    if (!senhaValida(nova)) return MENSAGEM_SENHA;
    if (nova === atual) return 'A senha nova precisa ser diferente da atual.';
    const nome = usuario.split('.')[0];
    if (nome.length >= 3 && semAcento(nova).toLowerCase().includes(nome)) return 'A senha não pode ter o seu nome de usuário.';
    return null;
}
