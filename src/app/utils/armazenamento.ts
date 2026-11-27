// localStorage pode não existir (servidor) ou estar bloqueado (navegação privada).
// Nesses casos o sistema continua funcionando; só não lembra os dados ao recarregar a página.

export function lerSalvo<T>(chave: string): T | null {
    try {
        const salvo = localStorage.getItem(chave);
        return salvo ? JSON.parse(salvo) : null;
    } catch {
        return null;
    }
}

export function salvar(chave: string, valor: unknown): void {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
        // Ver o comentário do topo.
    }
}

export function apagarSalvo(chave: string): void {
    try {
        localStorage.removeItem(chave);
    } catch {
        // Ver o comentário do topo.
    }
}

export function apagarSalvosQueComecamCom(prefixo: string): void {
    try {
        Object.keys(localStorage).filter(chave => chave.startsWith(prefixo)).forEach(chave => localStorage.removeItem(chave));
    } catch {
        // Ver o comentário do topo.
    }
}
