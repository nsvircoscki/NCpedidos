import { httpResource } from '@angular/common/http';
import { Injectable, computed } from '@angular/core';
import { RegistroAuditoria } from '../models/usuario.model';

/** Registro de auditoria para o admin: os 300 mais recentes (quem entrou e o que mudou). */
@Injectable()
export class AuditoriaStore {
  private readonly recurso = httpResource<RegistroAuditoria[]>(() => '/auditoria', { defaultValue: [] });
  readonly registros = computed(() => (this.recurso.hasValue() ? this.recurso.value() : []));
  readonly carregando = this.recurso.isLoading;
  readonly erro = this.recurso.error;

  recarregar(): void {
    this.recurso.reload();
  }
}
