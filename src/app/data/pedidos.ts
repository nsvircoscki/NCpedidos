import { CLIENTES_EXEMPLO } from './clientes';
import { documentoComTipo } from '../services/clientes-store';
import { ItemPedidoDetalhado, PedidoDetalhado } from '../models/pedido.model';

const PRODUTOS = {
  acrilicaPremium: { nome: 'Tinta Acrílica Premium', descricao: 'Branco Neve · Fosco', unidade: '18 L', precoUnitario: 289.9 },
  acrilicaStandard: { nome: 'Tinta Acrílica Standard', descricao: 'Gelo · Fosco', unidade: '18 L', precoUnitario: 199.9 },
  esmalte: { nome: 'Esmalte Sintético', descricao: 'Azul Del Rey · Brilhante', unidade: '3,6 L', precoUnitario: 94.5 },
  massaCorrida: { nome: 'Massa Corrida PVA', descricao: 'Interior · Fácil aplicação', unidade: '25 kg', precoUnitario: 78.4 },
  selador: { nome: 'Selador Acrílico', descricao: 'Incolor', unidade: '18 L', precoUnitario: 129.9 },
};

function item(produto: keyof typeof PRODUTOS, quantidade: number): ItemPedidoDetalhado {
  return { ...PRODUTOS[produto], quantidade };
}

type DadosPedido = Omit<PedidoDetalhado, 'volumes' | 'desconto' | 'total' | 'client' | 'documentoCliente' | 'cidade' | 'uf' > & { percentualDesconto: number};
// Volumes, desconto e total saem dos itens, para os números sempre baterem.
export function montarPedido({ percentualDesconto, ...dados }: DadosPedido): PedidoDetalhado {
  const cliente = CLIENTES_EXEMPLO.find(c => c.id === dados.clienteId);
  if (!cliente) {
    throw new Error(`Cliente com id ${dados.clienteId} não encontrado`);
  }
  const subtotal = dados.itens.reduce((soma, i) => soma + i.quantidade * i.precoUnitario, 0);
  const desconto = Math.round(subtotal * percentualDesconto * 100) / 100;
  return {
    ...dados,
    client: cliente.nome,
    documentoCliente: documentoComTipo(cliente),
    cidade: cliente.cidade,
    uf: cliente.uf,
    volumes: dados.itens.reduce((soma, i) => soma + i.quantidade, 0),
    desconto,
    total: Math.round((subtotal - desconto) * 100) / 100,
  };
}

export const PEDIDOS_EXEMPLO: PedidoDetalhado[] = [
  montarPedido({
    id: 1049, clienteId: 3, initials: 'CM', avatar: 'orange', date: '17 set.', status: 'Em análise',
    representante: 'Camila Rocha',
    pagamento: '28/56 dias', previsaoEntrega: 'Informado pela empresa', observacao: 'Descarregar pela doca lateral.',
    itens: [item('acrilicaPremium', 10), item('selador', 6), item('massaCorrida', 12)], percentualDesconto: 0.08,
  }),
  montarPedido({
    id: 1048, clienteId: 1, initials: 'CA', avatar: 'blue', date: '17 set.', status: 'Em análise',
    representante: 'Camila Rocha',
    pagamento: '28 dias', previsaoEntrega: 'Informado pela empresa', observacao: '',
    itens: [item('acrilicaPremium', 2), item('esmalte', 1), item('massaCorrida', 1)], percentualDesconto: 0.05,
  }),
  montarPedido({
    id: 1047, clienteId: 1,  initials: 'CA', avatar: 'blue', date: '16 set.', status: 'Faturado',
    representante: 'Camila Rocha',
    pagamento: '28 dias', previsaoEntrega: '20 set.', observacao: 'Entregar pela manhã.',
    itens: [item('acrilicaPremium', 6), item('esmalte', 8), item('massaCorrida', 10)], percentualDesconto: 0.05,
  }),
  montarPedido({
    id: 1046, clienteId: 4, initials: 'DN', avatar: 'orange', date: '15 set.', status: 'Aprovado',
    representante: 'Rafael Souza',
    pagamento: '28/56 dias', previsaoEntrega: '19 set.', observacao: '',
    itens: [item('acrilicaStandard', 18), item('selador', 12)], percentualDesconto: 0.06,
  }),
  montarPedido({
    id: 1045, clienteId: 5, initials: 'MC', avatar: 'blue', date: '14 set.', status: 'Em análise',
    representante: 'Rafael Souza',
    pagamento: 'À vista', previsaoEntrega: 'Informado pela empresa', observacao: 'Cliente pediu nota com CNPJ da filial.',
    itens: [item('esmalte', 12), item('massaCorrida', 8)], percentualDesconto: 0.03,
  }),
  montarPedido({
    id: 1044, clienteId: 6, initials: 'FF', avatar: 'orange', date: '13 set.', status: 'Faturado',
    representante: 'Camila Rocha',
    pagamento: '28 dias', previsaoEntrega: '17 set.', observacao: '',
    itens: [item('acrilicaPremium', 20), item('acrilicaStandard', 10), item('selador', 8)], percentualDesconto: 0.08,
  }),
  montarPedido({
    id: 1043, clienteId: 1, initials: 'CA', avatar: 'blue', date: '12 set.', status: 'Aprovado',
    representante: 'Camila Rocha',
    pagamento: 'À vista', previsaoEntrega: '15 set.', observacao: '',
    itens: [item('esmalte', 3), item('massaCorrida', 4)], percentualDesconto: 0,
  }),
];
