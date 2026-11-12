import { PreCadastro } from '../models/cliente.model';

export const PRE_CADASTROS: PreCadastro[] = [
  { id: 1047, nome: 'Casa Almeida Materiais', documento: 'CNPJ 12.345.678/0001-90', representante: 'Rafael Souza', cidade: 'Campinas', uf: 'SP', enviadoEm: 'Hoje, 10:24', status: 'Aguardando análise', prioridade: true },
  { id: 1052, nome: 'Depósito São Lucas', documento: 'CNPJ 29.604.118/0001-41', representante: 'Mariana Alves', cidade: 'Jundiaí', uf: 'SP', enviadoEm: 'Hoje, 09:48', status: 'Em revisão', prioridade: false },
  { id: 1053, nome: 'Tintas & Cia', documento: 'CNPJ 47.830.216/0001-07', representante: 'Rafael Souza', cidade: 'Sorocaba', uf: 'SP', enviadoEm: 'Hoje, 08:15', status: 'Aguardando análise', prioridade: false },
  { id: 1055, nome: 'João da Silva', documento: 'CPF 123.456.789-00', representante: 'Camila Rocha', cidade: 'Caxias do Sul', uf: 'RS', enviadoEm: 'Ontem, 17:02', status: 'Documentação pendente', prioridade: true },
  { id: 1058, nome: 'Constrular Materiais', documento: 'CNPJ 98.765.432/0001-10', representante: 'Mariana Alves', cidade: 'Farroupilha', uf: 'RS', enviadoEm: 'Ontem, 14:30', status: 'Em revisão', prioridade: false },
  { id: 1060, nome: 'Ferreira & Filhos', documento: 'CNPJ 55.666.777/0001-88', representante: 'Camila Rocha', cidade: 'Bento Gonçalves', uf: 'RS', enviadoEm: '10/11, 16:45', status: 'Aguardando análise', prioridade: false },
  { id: 1061, nome: 'Casa do Pintor', documento: 'CNPJ 31.222.444/0001-55', representante: 'Rafael Souza', cidade: 'Piracicaba', uf: 'SP', enviadoEm: '10/11, 11:10', status: 'Aguardando análise', prioridade: false },
];
