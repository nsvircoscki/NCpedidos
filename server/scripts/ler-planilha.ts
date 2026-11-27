import ExcelJS from 'exceljs';

/** As abas pedidas, cada uma como lista de linhas (começando em 0) com o valor de cada célula. */
export async function lerAbas(caminho: string, nomes: string[]): Promise<unknown[][][]> {
    const livro = new ExcelJS.Workbook();
    await livro.xlsx.readFile(caminho);
    return nomes.map(nome => {
        const aba = livro.getWorksheet(nome);
        if (!aba) throw new Error(`Aba "${nome}" não encontrada em ${caminho}.`);
        const linhas: unknown[][] = [];
        aba.eachRow({ includeEmpty: true }, (linha, numero) => {
            linhas[numero - 1] = (linha.values as ExcelJS.CellValue[]).slice(1).map(valorDaCelula);
        });
        return Array.from(linhas, linha => linha ?? []);
    });
}

function valorDaCelula(valor: ExcelJS.CellValue): unknown {
    if (valor && typeof valor === 'object') {
        if ('result' in valor) return valor.result;
        if ('richText' in valor) return valor.richText.map(parte => parte.text).join('');
        if ('text' in valor) return valor.text;
    }
    return valor;
}
