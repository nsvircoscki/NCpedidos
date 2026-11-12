import { Service } from '@angular/core';
import { PedidoDetalhado } from '../models/pedido.model';

const MARINHO: [number, number, number] = [21, 56, 96];
const CINZA: [number, number, number] = [100, 116, 139];
const MARGEM = 15;
const LARGURA_PAGINA = 210;
const DIREITA = LARGURA_PAGINA - MARGEM;

// Mesma logo da sidebar. A proporção vem do viewBox do SVG (192.6 x 66.5).
const LOGO_URL = 'assets/logo-nc-tintas.svg';
const LOGO_PROPORCAO = 192.6 / 66.5;
const LOGO_ALTURA_MM = 16;

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Gera o PDF do pedido: para enviar ao cliente (compartilhar) ou só baixar. */
@Service()
export class PedidoPdfService {
  async enviarAoCliente(pedido: PedidoDetalhado): Promise<void> {
    const arquivo = await this.gerar(pedido);
    if (navigator.canShare?.({ files: [arquivo] })) {
      try {
        await navigator.share({ files: [arquivo], title: `Pedido #${pedido.id}`, text: `Pedido #${pedido.id} - NC Tintas` });
        return;
      } catch (erro) {
        // Fechar a janela de compartilhar não é erro; outros problemas caem no download.
        if (erro instanceof DOMException && erro.name === 'AbortError') return;
      }
    }
    this.salvarArquivo(arquivo);
  }

  async baixar(pedido: PedidoDetalhado): Promise<void> {
    this.salvarArquivo(await this.gerar(pedido));
  }

  // jsPDF é importado só aqui, quando alguém pede o PDF: não pesa no carregamento das telas
  // e não roda no servidor (SSR), onde não existe navegador.
  async gerar(pedido: PedidoDetalhado): Promise<File> {
    const [{ jsPDF }, logo] = await Promise.all([import('jspdf'), this.carregarLogo()]);
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

    let y = this.cabecalho(pdf, pedido, logo);
    y = this.dadosCliente(pdf, pedido, y);
    y = this.tabelaItens(pdf, pedido, y);
    y = this.totais(pdf, pedido, y);
    this.condicoes(pdf, pedido, y);
    this.rodape(pdf);

    return new File([pdf.output('blob')], `pedido-${pedido.id}.pdf`, { type: 'application/pdf' });
  }

  // A logo é azul e vermelha sobre fundo claro, por isso o topo é branco e o azul fica numa faixa.
  private cabecalho(pdf: JsPdf, pedido: PedidoDetalhado, logo: string | null): number {
    if (logo) {
      pdf.addImage(logo, 'JPEG', MARGEM, 8, LOGO_ALTURA_MM * LOGO_PROPORCAO, LOGO_ALTURA_MM);
    } else {
      pdf.setTextColor(...MARINHO).setFont('helvetica', 'bold').setFontSize(20);
      pdf.text('NC Tintas', MARGEM, 19);
    }

    pdf.setTextColor(...MARINHO).setFont('helvetica', 'bold').setFontSize(14);
    pdf.text(`Pedido #${pedido.id}`, DIREITA, 14, { align: 'right' });
    pdf.setTextColor(...CINZA).setFont('helvetica', 'normal').setFontSize(10);
    pdf.text('Pedido de venda', DIREITA, 20, { align: 'right' });
    pdf.text(`Emitido em ${pedido.date}`, DIREITA, 25, { align: 'right' });

    pdf.setFillColor(...MARINHO);
    pdf.rect(0, 30, LARGURA_PAGINA, 1.5, 'F');
    return 44;
  }

  // jsPDF não lê SVG: a logo é desenhada num canvas (em 4x, para não ficar borrada) e vira JPEG.
  // JPEG com fundo branco deixa o PDF com ~35 KB; em PNG passava de 800 KB, pesado para o WhatsApp.
  // Se falhar, o PDF sai com o nome em texto em vez de não sair.
  private async carregarLogo(): Promise<string | null> {
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

  private dadosCliente(pdf: JsPdf, pedido: PedidoDetalhado, y: number): number {
    this.rotulo(pdf, 'CLIENTE', MARGEM, y);
    this.rotulo(pdf, 'REPRESENTANTE', 125, y);
    pdf.setTextColor(15, 23, 42).setFont('helvetica', 'bold').setFontSize(12);
    pdf.text(pedido.client, MARGEM, y + 6);
    pdf.text(pedido.representante, 125, y + 6);
    pdf.setTextColor(...CINZA).setFont('helvetica', 'normal').setFontSize(10);
    pdf.text(pedido.documentoCliente, MARGEM, y + 12);
    pdf.text(`${pedido.cidade} - ${pedido.uf}`, MARGEM, y + 17);
    return y + 30;
  }

  private tabelaItens(pdf: JsPdf, pedido: PedidoDetalhado, y: number): number {
    const colunas = { quantidade: 130, unitario: 160, subtotal: DIREITA };

    pdf.setFillColor(241, 245, 249);
    pdf.rect(MARGEM, y - 5, DIREITA - MARGEM, 8, 'F');
    pdf.setTextColor(...CINZA).setFont('helvetica', 'bold').setFontSize(9);
    pdf.text('Produto', MARGEM + 2, y);
    pdf.text('Qtd.', colunas.quantidade, y, { align: 'right' });
    pdf.text('Unitário', colunas.unitario, y, { align: 'right' });
    pdf.text('Subtotal', colunas.subtotal - 2, y, { align: 'right' });
    y += 10;

    for (const item of pedido.itens) {
      pdf.setTextColor(15, 23, 42).setFont('helvetica', 'bold').setFontSize(10);
      pdf.text(item.nome, MARGEM + 2, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(String(item.quantidade), colunas.quantidade, y, { align: 'right' });
      pdf.text(moeda.format(item.precoUnitario), colunas.unitario, y, { align: 'right' });
      pdf.text(moeda.format(item.quantidade * item.precoUnitario), colunas.subtotal - 2, y, { align: 'right' });
      pdf.setTextColor(...CINZA).setFontSize(9);
      pdf.text(`${item.descricao} · ${item.unidade}`, MARGEM + 2, y + 5);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(MARGEM, y + 9, DIREITA, y + 9);
      y += 15;
    }
    return y;
  }

  private totais(pdf: JsPdf, pedido: PedidoDetalhado, y: number): number {
    const subtotal = pedido.total + pedido.desconto;
    const linhas: [string, string][] = [
      ['Subtotal', moeda.format(subtotal)],
      ['Desconto comercial', `- ${moeda.format(pedido.desconto)}`],
      ['Frete', 'Grátis'],
    ];

    pdf.setFont('helvetica', 'normal').setFontSize(10);
    for (const [rotulo, valor] of linhas) {
      pdf.setTextColor(...CINZA).text(rotulo, 130, y);
      pdf.setTextColor(15, 23, 42).text(valor, DIREITA - 2, y, { align: 'right' });
      y += 6;
    }

    pdf.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...MARINHO);
    pdf.text('Total', 130, y + 3);
    pdf.text(moeda.format(pedido.total), DIREITA - 2, y + 3, { align: 'right' });
    return y + 18;
  }

  private condicoes(pdf: JsPdf, pedido: PedidoDetalhado, y: number): void {
    this.rotulo(pdf, 'CONDIÇÕES', MARGEM, y);
    const linhas = [
      `Pagamento: ${pedido.pagamento}`,
      `Previsão de entrega: ${pedido.previsaoEntrega}`,
      `Volumes: ${pedido.volumes}`,
    ];
    if (pedido.observacao) {
      linhas.push(`Observação: ${pedido.observacao}`);
    }

    pdf.setTextColor(15, 23, 42).setFont('helvetica', 'normal').setFontSize(10);
    pdf.text(pdf.splitTextToSize(linhas.join('\n'), DIREITA - MARGEM), MARGEM, y + 6);
  }

  private rodape(pdf: JsPdf): void {
    pdf.setTextColor(...CINZA).setFont('helvetica', 'normal').setFontSize(8);
    pdf.text('Preços e estoque sujeitos à validação antes do faturamento.', LARGURA_PAGINA / 2, 285, { align: 'center' });
  }

  private rotulo(pdf: JsPdf, texto: string, x: number, y: number): void {
    pdf.setTextColor(...CINZA).setFont('helvetica', 'bold').setFontSize(8);
    pdf.text(texto, x, y);
  }

  private salvarArquivo(arquivo: File): void {
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement('a');
    link.href = url;
    link.download = arquivo.name;
    link.click();
    URL.revokeObjectURL(url);
  }
}

type JsPdf = InstanceType<typeof import('jspdf').jsPDF>;
