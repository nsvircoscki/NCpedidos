/** "Açaí" → "acai": para buscar e comparar sem diferença de maiúscula ou acento. */
export function semAcento(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
