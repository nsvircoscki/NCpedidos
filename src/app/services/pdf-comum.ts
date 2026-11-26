// Partes usadas por todos os PDFs de pedido (pedido completo e pedido rápido).

export type JsPdf = InstanceType<typeof import('jspdf').jsPDF>;
export type Cor = [number, number, number];

export const MARINHO: Cor = [21, 56, 96];
export const CINZA: Cor = [100, 116, 139];
export const TEXTO: Cor = [15, 23, 42];
export const MARGEM = 15;
export const LARGURA_PAGINA = 210;
export const DIREITA = LARGURA_PAGINA - MARGEM;

// Mesma logo da sidebar. A proporção vem do viewBox do SVG (192.6 x 66.5).
const LOGO_URL = 'assets/logo-nc-tintas.svg';
export const LOGO_PROPORCAO = 192.6 / 66.5;
export const LOGO_ALTURA_MM = 16;

export const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// jsPDF é importado só quando alguém pede o PDF: não pesa no carregamento das telas
// e não roda no servidor (SSR), onde não existe navegador.
export async function novoPdf(): Promise<{ pdf: JsPdf; logo: string | null }> {
  const [{ jsPDF }, logo] = await Promise.all([import('jspdf'), carregarLogo()]);
  return { pdf: new jsPDF({ unit: 'mm', format: 'a4' }), logo };
}

/** No celular abre o menu de compartilhar (WhatsApp, e-mail...); no computador, baixa. */
export async function compartilharOuBaixar(arquivo: File, titulo: string): Promise<void> {
  if (navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo], title: titulo, text: titulo });
      return;
    } catch (erro) {
      // Fechar a janela de compartilhar não é erro; outros problemas caem no download.
      if (erro instanceof DOMException && erro.name === 'AbortError') return;
    }
  }
  baixarArquivo(arquivo);
}

export function baixarArquivo(arquivo: File): void {
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement('a');
  link.href = url;
  link.download = arquivo.name;
  link.click();
  URL.revokeObjectURL(url);
}

export function desenharLogo(pdf: JsPdf, logo: string | null): void {
  if (logo) {
    pdf.addImage(logo, 'JPEG', MARGEM, 8, LOGO_ALTURA_MM * LOGO_PROPORCAO, LOGO_ALTURA_MM);
  } else {
    pdf.setTextColor(...MARINHO).setFont('helvetica', 'bold').setFontSize(20);
    pdf.text('NC Tintas', MARGEM, 19);
  }
}

export function rotulo(pdf: JsPdf, texto: string, x: number, y: number): void {
  pdf.setTextColor(...CINZA).setFont('helvetica', 'bold').setFontSize(8);
  pdf.text(texto, x, y);
}

export function rodape(pdf: JsPdf, texto: string): void {
  pdf.setTextColor(...CINZA).setFont('helvetica', 'normal').setFontSize(8);
  pdf.text(texto, LARGURA_PAGINA / 2, 285, { align: 'center' });
}

export function arquivoPdf(pdf: JsPdf, nome: string): File {
  return new File([pdf.output('blob')], nome, { type: 'application/pdf' });
}

// jsPDF não lê SVG: a logo é desenhada num canvas (em 4x, para não ficar borrada) e vira JPEG.
// JPEG com fundo branco deixa o PDF com ~35 KB; em PNG passava de 800 KB, pesado para o WhatsApp.
// Se falhar, o PDF sai com o nome em texto em vez de não sair.
async function carregarLogo(): Promise<string | null> {
  try {
    const imagem = new Image();
    imagem.src = LOGO_URL;
    await imagem.decode();

    const canvas = document.createElement('canvas');
    canvas.height = 66.5 * 4;
    canvas.width = Math.round(canvas.height * LOGO_PROPORCAO);
    const contexto = canvas.getContext('2d');
    if (!contexto) return null;
    contexto.fillStyle = '#ffffff';
    contexto.fillRect(0, 0, canvas.width, canvas.height);
    contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  } catch {
    return null;
  }
}
