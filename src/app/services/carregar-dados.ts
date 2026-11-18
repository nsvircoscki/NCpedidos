import { WritableResource, resource } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../environments/environment';

const ATRASO_SIMULADO_MS = 800;

export function carregarDados<T>(caminho: string, dadosExemplo: T): WritableResource<T | undefined> {
  if (environment.usarDadosExemplo) {
    return resource({ loader: () => esperar(ATRASO_SIMULADO_MS).then(() => dadosExemplo) });
  }
  return httpResource<T>(() => caminho);
}

function esperar(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}