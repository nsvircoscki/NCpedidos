import { HttpErrorResponse } from '@angular/common/http';

/** A API explica o motivo (usuário repetido, senha curta...); sem resposta dela, vale o texto padrão. */
export function motivoDoErro(erro: unknown, padrao: string): string {
  return (erro instanceof HttpErrorResponse ? erro.error?.erro : null) ?? padrao;
}
