export interface Cliente {
    id: number;
    nome: string;
    cpfcnpj: string;
    email: string;
    telefone: string;
    endereco: string;
    dataNascimento: string | Date;
    dataCadastro: string | Date;
}