export interface Usuario {
    id: number;
    nome: string;
    usuario: string;
    /** Cadastra os outros usuários (tela Usuários). */
    admin?: boolean;
    /** Entrou com a senha provisória (dada pelo admin): precisa criar a sua antes de usar o sistema. */
    trocarSenha?: boolean;
    /** Verificação em duas etapas ativa: pede o código do app autenticador no login. Obrigatória para o admin. */
    doisPassos?: boolean;
}

/** O que fica guardado no navegador. O login em si fica num cookie que o JavaScript não lê. */
export interface Sessao {
    usuario: Usuario;
}

/** Resposta do login: a sessão, ou o aviso de que falta o código do app autenticador. */
export type RespostaLogin = Sessao | { precisaCodigo: true };

/** Para pôr no app autenticador: a chave (para digitar) e o link (para abrir direto no celular). */
export interface AtivacaoDoisPassos {
    segredo: string;
    link: string;
}


/** Usuário na tela Usuários (admin): `clientes` é quantos clientes já foram importados para ele. */
export interface UsuarioCadastrado extends Usuario {
    admin: boolean;
    clientes: number;
}

export interface NovoUsuario {
    nome: string;
    usuario: string;
    senha: string;
    admin: boolean;
}

/** Uma linha do registro de auditoria (tela Registro, admin). */
export interface RegistroAuditoria {
    id: number;
    quando: string;
    usuario: string;
    acao: string;
    detalhe: string;
    ip: string;
}

/** Edição do cadastro: a senha muda pelo "Alterar senha". */
export type DadosUsuario = Omit<NovoUsuario, 'senha'>;
