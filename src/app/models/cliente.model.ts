export interface Cliente {
    id: number;
    nome: string;
    cpfcnpj: string;
    email: string;
    telefone: string;
    dataNascimento: string | Date;
    dataCadastro: string | Date;
    endereco: string;
    cidade: string;
    uf: string;
    tipo: 'Pessoa Física' | 'Pessoa Jurídica';
    totalComprado: number;
    ultimaCompra?: Date | string;
    status: 'ATIVO' | 'INATIVO';
}