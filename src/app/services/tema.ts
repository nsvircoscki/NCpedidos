import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Service, signal } from '@angular/core';

/** O que a pessoa escolheu: claro, escuro ou seguir o sistema operacional. */
export type PreferenciaTema = 'claro' | 'escuro' | 'sistema';

const CHAVE_ARMAZENAMENTO = 'tema';

/**
 * Controla o modo escuro do sistema inteiro.
 * Coloca ou tira a classe "dark" do <html>; a variante dark: do Tailwind faz o resto.
 * A escolha fica salva no navegador (localStorage), então continua valendo ao recarregar.
 */
@Service()
export class TemaService {
  private readonly documento = inject(DOCUMENT);
  private readonly janela = this.documento.defaultView;

  /** Preferência salva. Começa seguindo o sistema operacional. */
  readonly preferencia = signal<PreferenciaTema>(this.lerPreferenciaSalva());

  /** Se o sistema operacional está em modo escuro (atualiza sozinho se a pessoa mudar lá). */
  private readonly sistemaEscuro = signal(this.consultaEscuro()?.matches ?? false);

  /** O tema que está valendo agora, já resolvendo o "sistema". */
  readonly escuro = computed(() =>
    this.preferencia() === 'sistema' ? this.sistemaEscuro() : this.preferencia() === 'escuro'
  );

  constructor() {
    this.consultaEscuro()?.addEventListener('change', (evento) => this.sistemaEscuro.set(evento.matches));

    // Sempre que "escuro" mudar, aplica no <html>.
    effect(() => {
      this.documento.documentElement.classList.toggle('dark', this.escuro());
    });
  }

  /**
   * Botão do header: troca entre claro e escuro (deixa de seguir o sistema).
   * Com o clique, o tema novo se espalha em círculo a partir do botão.
   */
  alternar(evento?: MouseEvent): void {
    const novoEscuro = !this.escuro();
    const html = this.documento.documentElement;

    const aplicar = () => {
      // Muda a classe na hora (sem esperar o effect): a View Transition precisa do
      // DOM já atualizado quando esta função termina, para "fotografar" o depois.
      html.classList.toggle('dark', novoEscuro);
      this.definir(novoEscuro ? 'escuro' : 'claro');
    };

    const menosMovimento = this.janela?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!this.documento.startViewTransition || menosMovimento) {
      aplicar(); // navegador sem suporte ou pessoa pediu menos movimento: troca direto
      return;
    }

    // Centro do círculo: o meio do botão clicado. Usar o botão (e não clientX/clientY)
    // funciona também com Enter/Espaço, em que o "clique" vem do teclado com posição 0,0.
    const botao = (evento?.currentTarget as HTMLElement | null)?.getBoundingClientRect();
    const x = botao ? botao.left + botao.width / 2 : this.janela!.innerWidth;
    const y = botao ? botao.top + botao.height / 2 : 0;
    // Raio que alcança o canto mais distante da tela, para o círculo cobrir tudo.
    const raio = Math.hypot(Math.max(x, this.janela!.innerWidth - x), Math.max(y, this.janela!.innerHeight - y));

    // A classe limita o CSS da transição só à troca de tema (não afeta outras View Transitions).
    html.classList.add('trocando-tema');
    const transicao = this.documento.startViewTransition(aplicar);

    // Quando as duas "fotos" (antes e depois) estão prontas, revela a nova num círculo crescente.
    transicao.ready.then(() => {
      html.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${raio}px at ${x}px ${y}px)`] },
        { duration: 550, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
    transicao.finished.finally(() => html.classList.remove('trocando-tema'));
  }

  definir(preferencia: PreferenciaTema): void {
    this.preferencia.set(preferencia);
    try {
      this.janela?.localStorage.setItem(CHAVE_ARMAZENAMENTO, preferencia);
    } catch {
      // Navegação privada ou armazenamento bloqueado: o tema vale só até recarregar.
    }
  }

  private lerPreferenciaSalva(): PreferenciaTema {
    try {
      const salvo = this.janela?.localStorage.getItem(CHAVE_ARMAZENAMENTO);
      if (salvo === 'claro' || salvo === 'escuro' || salvo === 'sistema') {
        return salvo;
      }
    } catch {
      // Sem acesso ao armazenamento: usa o padrão.
    }
    return 'sistema';
  }

  private consultaEscuro(): MediaQueryList | undefined {
    return this.janela?.matchMedia?.('(prefers-color-scheme: dark)');
  }
}
