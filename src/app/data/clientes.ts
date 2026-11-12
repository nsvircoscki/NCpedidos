import { ClienteSelecao } from '../models/cliente.model';

export const CLIENTES_SELECAO: ClienteSelecao[] = [
  {
    id: 'casa-almeida',
    nome: 'Casa Almeida Materiais',
    documento: 'CNPJ 12.345.678/0001-90',
    limite: 8450,
    bairro: 'Centro',
    cidade: 'Caxias do Sul',
    uf: 'RS',
  },
  {
    id: 'joao-silva',
    nome: 'João da Silva',
    documento: 'CPF 123.456.789-00',
    limite: 2000,
    bairro: 'São Pelegrino',
    cidade: 'Caxias do Sul',
    uf: 'RS',
  },
  {
    id: 'constrular',
    nome: 'Constrular Materiais',
    documento: 'CNPJ 98.765.432/0001-10',
    limite: 15000,
    bairro: 'Distrito Industrial',
    cidade: 'Farroupilha',
    uf: 'RS',
  },
];
