import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';

// Cifra o que o servidor precisa ler de volta (o segredo da verificação em duas etapas): quem copiar o banco
// não consegue usar. AES-256-GCM, que também detecta se o texto cifrado foi alterado.

/** Chave de 256 bits derivada de um segredo do ambiente, separada por finalidade. */
export function chaveDe(segredoDoAmbiente: string, finalidade: string): Buffer {
    return Buffer.from(hkdfSync('sha256', segredoDoAmbiente, '', finalidade, 32));
}

export function cifrar(texto: string, chave: Buffer): string {
    const iv = randomBytes(12);
    const cifra = createCipheriv('aes-256-gcm', chave, iv);
    const dados = Buffer.concat([cifra.update(texto, 'utf8'), cifra.final()]);
    return [iv, cifra.getAuthTag(), dados].map(parte => parte.toString('base64')).join('.');
}

export function decifrar(cifrado: string, chave: Buffer): string {
    const [iv, etiqueta, dados] = cifrado.split('.').map(parte => Buffer.from(parte, 'base64'));
    const decifra = createDecipheriv('aes-256-gcm', chave, iv);
    decifra.setAuthTag(etiqueta);
    return Buffer.concat([decifra.update(dados), decifra.final()]).toString('utf8');
}
