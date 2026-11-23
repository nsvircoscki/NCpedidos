export interface Cliente {
    id: number;
    nome: string;
    cpfcnpj: string;
    email: string;
    telefone: string;
    dataNascimento: string | Date;
    dataCadastro: string | Date;
    endereco: string;
    bairro: string;
    cidade: string;
    uf: string;
    tipo: 'Pessoa Física' | 'Pessoa Jurídica';
    totalComprado: number;
    limite: number;
    ultimaCompra?: Date | string;
    status: 'ATIVO' | 'INATIVO';
}



/** Cliente como aparece no seletor de cliente (novo pedido e produtos). */
export interface ClienteSelecao {
    id: number;
    nome: string;
    documento: string;
    limite: number;
    bairro: string;
    cidade: string;
    uf: string;
}

/** Tipo do pré-cadastro: escolhido antes de preencher, define quais campos aparecem. */
export type TipoCadastro = 'PJ' | 'PF';

export type StatusPreCadastro = 'Aguardando análise' | 'Em revisão' | 'Documentação pendente' | 'Aprovado' | 'Rejeitado';

/** Pré-cadastro enviado por um representante, esperando a análise do administrativo. */
export interface PreCadastro {
    id: number;
    nome: string;
    documento: string;
    representante: string;
    cidade: string;
    uf: string;
    enviadoEm: string;
    status: StatusPreCadastro;
    prioridade: boolean;
    motivoRecusa?: string;
}

export interface DadosPreCadastro {
    cpf: string;
    nomeCompleto: string;
    atuacao: string;
    segmento: string;
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
    responsavel: string;
    telefone: string;
    email: string;
    endereco: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    perfil: {
        trabalhaComOutrasMarcas: boolean;
        buscaMelhoresCondicoes: boolean;
        entregaRecorrente: boolean;
        interessePreparacao: boolean;
        novoEmpredimento: boolean;
        resumoComercial: string;
        melhorHorario: string;
    };
    observacoes: {
        texto: string;
        categoria: 'Perfil comercial' | 'Entrega' | 'Pagamento';
        destacar: boolean;
    };
}