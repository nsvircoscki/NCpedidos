/** "Açaí" → "acai": para buscar e comparar sem diferença de maiúscula ou acento. */
export function semAcento(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Itens cujo texto (montado por `campos`) contém o termo, sem diferença de maiúscula ou acento. */
export function filtrarPorTexto<T>(itens: T[], termo: string, campos: (item: T) => string): T[] {
    const busca = semAcento(termo.trim());
    return busca ? itens.filter(item => semAcento(campos(item)).includes(busca)) : itens;
}
