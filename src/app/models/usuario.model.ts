export interface Usuario {
    id: number;
    nome: string;
    email: string;
    /** Cadastra os outros usuários (tela Usuários). */
    admin?: boolean;
}

export interface Sessao {
    token: string;
    usuario: Usuario;
}


/** Usuário na tela Usuários (admin): `clientes` é quantos clientes já foram importados para ele. */
export interface UsuarioCadastrado extends Usuario {
    admin: boolean;
    clientes: number;
}

export interface NovoUsuario {
    nome: string;
    email: string;
    senha: string;
    admin: boolean;
}
