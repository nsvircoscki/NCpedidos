// Freio contra adivinhar senha, em janelas de 15 minutos: 10 erros por endereço e 5 por usuário.
// O limite por usuário pega quem tenta de vários endereços; o preço é que alguém consegue travar um usuário
// por 15 minutos. Vale para qualquer nome digitado, existindo ou não, para não revelar quem tem conta.
const JANELA_MS = 15 * 60 * 1000;
const LIMITE_POR_ENDERECO = 10;
const LIMITE_POR_USUARIO = 5;
// Acima disso, os registros vencidos são apagados, para a memória não crescer sem fim.
const REGISTROS_ANTES_DE_LIMPAR = 10_000;

interface Registro {
    quantidade: number;
    desde: number;
}
const tentativas = new Map<string, Registro>();

export function bloqueadoPorTentativas(ip: string, usuario: string, agora = Date.now()): boolean {
    return chaves(ip, usuario).some(([chave, limite]) => (registroValido(chave, agora)?.quantidade ?? 0) >= limite);
}

export function registrarTentativaErrada(ip: string, usuario: string, agora = Date.now()): void {
    if (tentativas.size > REGISTROS_ANTES_DE_LIMPAR) {
        for (const [chave] of tentativas) if (!registroValido(chave, agora)) tentativas.delete(chave);
    }
    for (const [chave] of chaves(ip, usuario)) {
        const registro = registroValido(chave, agora);
        if (registro) registro.quantidade++;
        else tentativas.set(chave, { quantidade: 1, desde: agora });
    }
}

export function limparTentativas(ip: string, usuario: string): void {
    for (const [chave] of chaves(ip, usuario)) tentativas.delete(chave);
}

function chaves(ip: string, usuario: string): [string, number][] {
    return [[`ip:${ip}`, LIMITE_POR_ENDERECO], [`usuario:${usuario.trim().toLowerCase()}`, LIMITE_POR_USUARIO]];
}

function registroValido(chave: string, agora: number): Registro | undefined {
    const registro = tentativas.get(chave);
    return registro && agora - registro.desde <= JANELA_MS ? registro : undefined;
}
