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

/** Cliente como aparece no seletor de cliente (novo pedido e produtos). */
export interface ClienteSelecao {
    id: string;
    nome: string;
    documento: string;
    limite: number;
    bairro: string;
    cidade: string;
    uf: string;
}

/** Tipo do pré-cadastro: escolhido antes de preencher, define quais campos aparecem. */
export type TipoCadastro = 'PJ' | 'PF';
