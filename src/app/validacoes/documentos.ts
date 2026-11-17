import { SchemaPath, validate } from '@angular/forms/signals';

const PESOS_CPF = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_CNPJ = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

export function validarCPF(campo: SchemaPath<string>): void {
    validate(campo, ({ value }) =>
        !value() || digitosConferem(value(), PESOS_CPF) ? null : { kind: 'cpf', message: 'CPF inválido.' });
}

export function validarCNPJ(campo: SchemaPath<string>): void {
    validate(campo, ({ value }) =>
        !value() || digitosConferem(value(), PESOS_CNPJ) ? null : { kind: 'cnpj', message: 'CNPJ inválido.' });
}

function digitosConferem(documento: string, pesos: number[]): boolean {
    const numeros = documento.replace(/\D/g, '').split('').map(Number);
    if (numeros.length !== pesos.length + 1 || new Set(numeros).size === 1) return false;

    return digitoVerificador(numeros, pesos.slice(1)) === numeros.at(-2)
        && digitoVerificador(numeros, pesos) === numeros.at(-1);
}

function digitoVerificador(numeros: number[], pesos: number[]): number {
    const resto = pesos.reduce((soma, peso, i) => soma + peso * numeros[i], 0) % 11;
    return resto < 2 ? 0 : 11 - resto;
}
