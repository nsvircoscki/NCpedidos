// en-CA formata como AAAA-MM-DD no fuso de quem usa, igual ao valor do <input type="date">.
export function hojeNoFormatoDoInput(): string {
    return new Date().toLocaleDateString('en-CA');
  }
  
export function formatarData(dataDoInput: string): string {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new
  Date(`${dataDoInput}T00:00`));
  }