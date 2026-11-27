import { Service } from '@angular/core';
import { ItemPedidoRapido, PedidoRapido } from '../models/pedido-rapido.model';
import { nomeDoArquivo } from '../utils/pedido-rapido';
import {
  CINZA, DIREITA, JsPdf, LARGURA_PAGINA, MARGEM, MARINHO, TEXTO, arquivoPdf, baixarArquivo, compartilharOuBaixar,
  desenharLogo, novoPdf, rodape, rotulo,
} from './pdf-comum';

const COLUNAS = { codigo: MARGEM + 2, produto: 45, quantidade: DIREITA - 2 };
const LARGURA_PRODUTO = COLUNAS.quantidade - COLUNAS.produto - 20;
const FIM_DA_PAGINA = 270;
const INICIO_PAGINA_NOVA = 20;

const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

/** PDF do pedido rápido, sem preço: os funcionários lançam no ERP com a tabela do cliente. */
@Service()
export class PedidoRapidoPdfService {
  async enviar(pedido: PedidoRapido): Promise<void> {
    await compartilharOuBaixar(await this.gerar(pedido), `Pedido ${pedido.numero} - ${pedido.cliente.nome}`);
  }

  async baixar(pedido: PedidoRapido): Promise<void> {
    baixarArquivo(await this.gerar(pedido));
  }

  async gerar(pedido: PedidoRapido): Promise<File> {
    const { pdf, logo } = await novoPdf();

    let y = this.cabecalho(pdf, pedido, logo);
    y = this.dadosPedido(pdf, pedido, y);
    y = this.tabelaItens(pdf, pedido.itens, y);
    this.observacao(pdf, pedido.observacao, y);
    this.rodapes(pdf);

    return arquivoPdf(pdf, nomeDoArquivo(pedido.cliente.nome, pedido.numero));
  }

  private cabecalho(pdf: JsPdf, pedido: PedidoRapido, logo: string | null): number {
    desenharLogo(pdf, logo);

    pdf.setTextColor(...MARINHO).setFont('helvetica', 'bold').setFontSize(14);
    pdf.text('Pedido de venda', DIREITA, 14, { align: 'right' });
    pdf.setTextColor(...CINZA).setFont('helvetica', 'normal').setFontSize(10);
    pdf.text(`Nº ${pedido.numero}`, DIREITA, 20, { align: 'right' });
    pdf.text(`Emitido em ${dataHora.format(pedido.emitidoEm)}`, DIREITA, 25, { align: 'right' });

    pdf.setFillColor(...MARINHO);
    pdf.rect(0, 30, LARGURA_PAGINA, 1.5, 'F');
    return 44;
  }

  private dadosPedido(pdf: JsPdf, pedido: PedidoRapido, y: number): number {
    rotulo(pdf, 'CLIENTE', MARGEM, y);
    rotulo(pdf, 'REPRESENTANTE', 125, y);
    pdf.setTextColor(...TEXTO).setFont('helvetica', 'bold').setFontSize(12);
    const linhasCliente: string[] = pdf.splitTextToSize(pedido.cliente.nome, 105);
    pdf.text(linhasCliente, MARGEM, y + 6);
    pdf.text(pdf.splitTextToSize(pedido.representante, DIREITA - 125), 125, y + 6);

    const abaixoDoNome = y + 6 + linhasCliente.length * 5;
    pdf.setTextColor(...CINZA).setFont('helvetica', 'normal').setFontSize(10);
    const { codigo, tabela, codigoTabela } = pedido.cliente;
    const linhasTabela: string[] = pdf.splitTextToSize(
      [codigo && `Cód. ${codigo}`, `Tabela de preço: ${tabela} (nº ${codigoTabela})`].filter(Boolean).join('\n'), 105,
    );
    pdf.text(linhasTabela, MARGEM, abaixoDoNome + 1);
    return abaixoDoNome + linhasTabela.length * 5 + 9;
  }

  private tabelaItens(pdf: JsPdf, itens: ItemPedidoRapido[], y: number): number {
    y = this.cabecalhoTabela(pdf, y);

    for (const item of itens) {
      const linhasNome: string[] = pdf.setFont('helvetica', 'bold').setFontSize(10).splitTextToSize(item.descricao, LARGURA_PRODUTO);
      const altura = linhasNome.length * 5 + 5;
      if (y + altura > FIM_DA_PAGINA) {
        pdf.addPage();
        y = this.cabecalhoTabela(pdf, INICIO_PAGINA_NOVA);
      }

      pdf.setTextColor(...TEXTO).setFont('helvetica', 'normal').setFontSize(10);
      pdf.text(item.codigo, COLUNAS.codigo, y);
      pdf.setFont('helvetica', 'bold');
      pdf.text(linhasNome, COLUNAS.produto, y);
      pdf.setFont('helvetica', 'bold').setFontSize(11);
      pdf.text(String(item.quantidade), COLUNAS.quantidade, y, { align: 'right' });

      pdf.setDrawColor(226, 232, 240);
      pdf.line(MARGEM, y + altura - 4, DIREITA, y + altura - 4);
      y += altura;
    }
    return y + 6;
  }

  private cabecalhoTabela(pdf: JsPdf, y: number): number {
    pdf.setFillColor(241, 245, 249);
    pdf.rect(MARGEM, y - 5, DIREITA - MARGEM, 8, 'F');
    pdf.setTextColor(...CINZA).setFont('helvetica', 'bold').setFontSize(9);
    pdf.text('Código', COLUNAS.codigo, y);
    pdf.text('Produto', COLUNAS.produto, y);
    pdf.text('Qtd.', COLUNAS.quantidade, y, { align: 'right' });
    return y + 10;
  }

  private observacao(pdf: JsPdf, observacao: string, y: number): void {
    if (!observacao.trim()) return;

    const linhas: string[] = pdf.setFont('helvetica', 'normal').setFontSize(10).splitTextToSize(observacao, DIREITA - MARGEM);
    if (y + linhas.length * 5 + 8 > FIM_DA_PAGINA) {
      pdf.addPage();
      y = INICIO_PAGINA_NOVA;
    }
    rotulo(pdf, 'OBSERVAÇÃO', MARGEM, y);
    pdf.setTextColor(...TEXTO).setFont('helvetica', 'normal').setFontSize(10);
    pdf.text(linhas, MARGEM, y + 6);
  }

  // O rodapé vai em todas as páginas, com a numeração quando o pedido passa de uma folha.
  private rodapes(pdf: JsPdf): void {
    const total = pdf.getNumberOfPages();
    for (let pagina = 1; pagina <= total; pagina++) {
      pdf.setPage(pagina);
      const numeracao = total > 1 ? ` Página ${pagina} de ${total}.` : '';
      rodape(pdf, `Lançar no ERP com a tabela de preço do cliente.${numeracao}`);
    }
  }
}
