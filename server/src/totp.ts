import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// Código de 6 números que muda a cada 30 s (RFC 6238): o mesmo do Google Authenticator e do Microsoft Authenticator.
const ALFABETO_BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const PASSO_SEGUNDOS = 30;
const DIGITOS = 6;
const NOME_NO_APP = 'NC Pedidos';

/** Segredo novo de 160 bits, em base32 (o formato que o app autenticador recebe). */
export function novoSegredo(): string {
    return paraBase32(randomBytes(20));
}

/** Link que o celular abre direto no app autenticador. */
export function linkDoAutenticador(segredo: string, usuario: string): string {
    const rotulo = encodeURIComponent(`${NOME_NO_APP}:${usuario}`);
    return `otpauth://totp/${rotulo}?secret=${segredo}&issuer=${encodeURIComponent(NOME_NO_APP)}`;
}

export function codigoDoPasso(segredo: string, passo: number): string {
    const contador = Buffer.alloc(8);
    contador.writeBigUInt64BE(BigInt(passo));
    const hmac = createHmac('sha1', deBase32(segredo)).update(contador).digest();
    const inicio = hmac[hmac.length - 1] & 0x0f;
    return String((hmac.readUInt32BE(inicio) & 0x7fffffff) % 10 ** DIGITOS).padStart(DIGITOS, '0');
}

/**
 * Passo de 30 s em que o código confere, ou null. Aceita o passo anterior e o seguinte, porque o relógio
 * do celular pode estar um pouco adiantado ou atrasado. Quem chama guarda o passo para o código não valer duas vezes.
 */
export function passoDoCodigo(segredo: string, codigo: unknown, agora = Date.now()): number | null {
    if (typeof codigo !== 'string' || !/^\d{6}$/.test(codigo)) return null;
    const atual = Math.floor(agora / 1000 / PASSO_SEGUNDOS);
    return [atual - 1, atual, atual + 1].find(passo =>
        timingSafeEqual(Buffer.from(codigoDoPasso(segredo, passo)), Buffer.from(codigo))) ?? null;
}

function paraBase32(bytes: Buffer): string {
    let bits = '';
    for (const byte of bytes) bits += byte.toString(2).padStart(8, '0');
    return (bits.match(/.{1,5}/g) ?? []).map(grupo => ALFABETO_BASE32[parseInt(grupo.padEnd(5, '0'), 2)]).join('');
}

function deBase32(texto: string): Buffer {
    const bits = [...texto.replace(/=+$/, '').toUpperCase()]
        .map(letra => ALFABETO_BASE32.indexOf(letra).toString(2).padStart(5, '0'))
        .join('');
    return Buffer.from((bits.match(/.{8}/g) ?? []).map(byte => parseInt(byte, 2)));
}
