import { Service } from '@angular/core';
import { PedidoDetalhado } from '../models/pedido.model';
import {
  CINZA, DIREITA, JsPdf, LARGURA_PAGINA, MARGEM, MARINHO, TEXTO, arquivoPdf, baixarArquivo,
  compartilharOuBaixar, desenharLogo, moeda, novoPdf, rodape, rotulo,
} from './pdf-comum';

/** Gera o PDF do pedido: para enviar ao cliente (compartilhar) ou só baixar. */
@Service()
export class PedidoPdfService {
  async enviarAoCliente(pedido: PedidoDetalhado): Promise<void> {
    await compartilharOuBaixar(await this.gerar(pedido), `Pedido #${pedido.id} - NC Tintas`);
  }

  async baixar(pedido: PedidoDetalhado): Promise<void> {
    baixarArquivo(await this.gerar(pedido));
  }

  async gerar(pedido: PedidoDetalhado): Promise<File> {
    const { pdf, logo } = await novoPdf();

    let y = this.cabecalho(pdf, pedido, logo);
    y = this.dadosCliente(pdf, pedido, y);
    y = this.tabelaItens(pdf, pedido, y);
    y = this.totais(pdf, pedido, y);
    this.condicoes(pdf, pedido, y);
    rodape(pdf, 'Preços e estoque sujeitos à validação antes do faturamento.');

    return arquivoPdf(pdf, `pedido-${pedido.id}.pdf`);
  }

  // A logo é azul e vermelha sobre fundo claro, por isso o topo é branco e o azul fica numa faixa.
  private cabecalho(pdf: JsPdf, pedido: PedidoDetalhado, logo: string | null): number {
    desenharLogo(pdf, logo);

    pdf.setTextColor(...MARINHO).setFont('helvetica', 'bold').setFontSize(14);
    pdf.text(`Pedido #${pedido.id}`, DIREITA, 14, { align: 'right' });
    pdf.setTextColor(...CINZA).setFont('helvetica', 'normal').setFontSize(10);
    pdf.text('Pedido de venda', DIREITA, 20, { align: 'right' });
    pdf.text(`Emitido em ${pedido.date}`, DIREITA, 25, { align: 'right' });

    pdf.setFillColor(...MARINHO);
    pdf.rect(0, 30, LARGURA_PAGINA, 1.5, 'F');
    return 44;
  }

  private dadosCliente(pdf: JsPdf, pedido: PedidoDetalhado, y: number): number {
    rotulo(pdf, 'CLIENTE', MARGEM, y);
    rotulo(pdf, 'REPRESENTANTE', 125, y);
    pdf.setTextColor(...TEXTO).setFont('helvetica', 'bold').setFontSize(12);
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
      pdf.setTextColor(...TEXTO).setFont('helvetica', 'bold').setFontSize(10);
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
    for (const [texto, valor] of linhas) {
      pdf.setTextColor(...CINZA).text(texto, 130, y);
      pdf.setTextColor(...TEXTO).text(valor, DIREITA - 2, y, { align: 'right' });
      y += 6;
    }

    pdf.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...MARINHO);
    pdf.text('Total', 130, y + 3);
    pdf.text(moeda.format(pedido.total), DIREITA - 2, y + 3, { align: 'right' });
    return y + 18;
  }

  private condicoes(pdf: JsPdf, pedido: PedidoDetalhado, y: number): void {
    rotulo(pdf, 'CONDIÇÕES', MARGEM, y);
    const linhas = [
      `Pagamento: ${pedido.pagamento}`,
      `Previsão de entrega: ${pedido.previsaoEntrega}`,
      `Volumes: ${pedido.volumes}`,
    ];
    if (pedido.observacao) {
      linhas.push(`Observação: ${pedido.observacao}`);
    }

    pdf.setTextColor(...TEXTO).setFont('helvetica', 'normal').setFontSize(10);
    pdf.text(pdf.splitTextToSize(linhas.join('\n'), DIREITA - MARGEM), MARGEM, y + 6);
  }
}
