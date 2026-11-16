import { resource } from '@angular/core';

const ATRASO_SIMULADO_MS = 800;

/** Simula a demora da API enquanto os dados são mock. Com backend, troque por httpResource. */
export function carregarExemplo<T>(dados: T) {
  return resource({ loader: () => esperar(ATRASO_SIMULADO_MS).then(() => dados) });
}

function esperar(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
