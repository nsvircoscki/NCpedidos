export interface Usuario {
    id: number;
    nome: string;
    email: string;
}

export interface Sessao {
    token: string;
    usuario: Usuario;
}

