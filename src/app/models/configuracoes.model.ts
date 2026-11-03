export interface Configuracoes {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
}

export interface ConfiguracoesSelecionadas {
    id: string;
    label: string;
    value: string;
    options: string[];
}

export interface ConfiguracoesSecao {
    descricao: string;
    opcoes: Configuracoes[];
    selecionadas: ConfiguracoesSelecionadas[];
}