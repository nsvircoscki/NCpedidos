// Lê a planilha "Tabela de Preço" exportada do ERP. Formato:
//   linha 1: "Tabela de Preço: NOME DO CLIENTE"
//   linha 2: "Código da tabela: 155  |  Emitido em 26/11/2026 14:05"
//   linha 4: Código | Descrição | Unidade | Preço
//   linha 5 em diante: os produtos

export interface ItemPlanilha {
    codigo: string;
    descricao: string;
    unidade: string;
    preco: number;
}

export interface TabelaCliente {
    cliente: string;
    codigoTabela: string;
    emitidaEm: string | null;
    itens: ItemPlanilha[];
}

const PRIMEIRA_LINHA_DE_PRODUTO = 4;

export function lerTabelaCliente(linhas: unknown[][]): TabelaCliente {
    const cliente = depoisDosDoisPontos(texto(linhas[0]?.[0]), 'Tabela de Preço');
    const cabecalho = texto(linhas[1]?.[0]);
    const codigoTabela = cabecalho.match(/Código da tabela:\s*(\S+)/i)?.[1];
    if (!cliente || !codigoTabela) {
        throw new Error('Não está no formato "Tabela de Preço" do ERP (linhas 1 e 2).');
    }

    const itens = linhas.slice(PRIMEIRA_LINHA_DE_PRODUTO).flatMap(linha => {
        const [codigo, descricao, unidade, preco] = linha.map(texto);
        const valor = paraNumero(preco);
        return codigo && descricao && !Number.isNaN(valor) ? [{ codigo, descricao, unidade, preco: valor }] : [];
    });

    return { cliente, codigoTabela, emitidaEm: dataDeEmissao(cabecalho), itens };
}

function texto(valor: unknown): string {
    return valor === null || valor === undefined ? '' : String(valor).trim();
}

function depoisDosDoisPontos(linha: string, rotulo: string): string {
    return linha.startsWith(rotulo) ? linha.slice(linha.indexOf(':') + 1).trim() : '';
}

// O ERP escreve a hora de Brasília: "Emitido em 26/11/2026 14:05".
function dataDeEmissao(cabecalho: string): string | null {
    const partes = cabecalho.match(/Emitido em (\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
    if (!partes) return null;
    const [, dia, mes, ano, hora, minuto] = partes;
    return `${ano}-${mes}-${dia}T${hora}:${minuto}:00-03:00`;
}

// Aceita 13.94 (número da planilha), "13,94" e "1.049,50".
function paraNumero(valor: string): number {
    if (!/\d/.test(valor)) return NaN;
    return Number(valor.includes(',') ? valor.replace(/\./g, '').replace(',', '.') : valor);
}
