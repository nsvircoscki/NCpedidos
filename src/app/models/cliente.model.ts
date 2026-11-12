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

export interface ClienteOption {
    id: number;
    nome: string;
    documento: string;   // CPF ou CNPJ
    limite: number;      // limite de crédito disponível
}
