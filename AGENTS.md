# Instruções para agentes (Claude Code, Codex e outros)

Este arquivo é a fonte única das regras do projeto. O `CLAUDE.md` só importa este arquivo,
então qualquer mudança feita aqui vale para todos os agentes.

## Antes de começar e ao terminar (obrigatório)

1. **Ao começar**, leia `docs/PROGRESSO.md`. Ele diz o estado atual, as pendências e o que
   o último agente fez.
2. **Ao terminar uma tarefa**, atualize `docs/PROGRESSO.md`: ajuste "Estado atual" e
   "Pendências" e adicione uma linha no "Histórico" com a data, o resumo e quem fez
   (Claude, Codex...).
3. Se descobrir algo que não é óbvio e que causaria erro de novo (bug de biblioteca,
   comando que falha no Windows...), registre na seção "Armadilhas conhecidas" abaixo.
4. Não faça commits sem a pessoa pedir.

## Modo de ensino (obrigatório)

Quem desenvolve este projeto está aprendendo Angular. Sempre que for pedido para ensinar
ou explicar como fazer algo:

1. **Diga o arquivo de cada trecho de código**, com o caminho completo a partir da raiz
   (ex.: `src/app/components/clientes/clientes-table.component.ts`). Nunca mostre um bloco
   de código sem dizer onde ele vai.
2. **Diga onde, dentro do arquivo**, o trecho entra (ex.: "logo abaixo do
   `type TipoDropdownCliente`", "dentro da classe, junto com `termoBusca`").
3. **Explique por que o código fica naquele arquivo** e não em outro (ex.: componente x
   página, `.ts` x `.html`, model x service, `styles.scss` global x classe Tailwind).
4. **Explique a lógica**: o que cada parte faz e por que foi escrita assim, não só o código pronto.
5. Quando o pedido for "me ensine", **não altere os arquivos**: mostre o código para a
   pessoa escrever, a menos que ela peça para aplicar.

Mesmo quando a tarefa for implementar (não ensinar), ao final liste os arquivos alterados
e o motivo de cada alteração. Responda em português.

## Projeto

- Sistema de pedidos da NC Tintas para representantes de vendas: dashboard, pedidos,
  produtos/preços, clientes (lista, pré-cadastro, análise), tabelas de preço, configurações e login.
- Angular 22 com componentes standalone, Tailwind CSS v4 (`src/styles.scss`) e
  `@scripttype/ng-motion` 0.5.0 para animações.
- Os dados ainda são mock (sem backend). O login ainda não funciona e, por decisão de quem
  desenvolve, será a última coisa a ser feita.
- Estrutura em `src/app/`:
  - `pages/`: telas com rota própria (registradas em `app.routes.ts`, com `loadComponent`)
  - `components/`: peças reutilizáveis usadas dentro das páginas
  - `layout/`: sidebar, headers e navegação comuns a todas as telas internas
    (as páginas não incluem esses componentes; o `LayoutComponent` faz isso)
  - `models/`: interfaces dos dados
  - `services/`: acesso e compartilhamento de dados
- Textos da interface e nomes no código em português.
- Conferir o build: `npx ng build`. O aviso NG8113 (`PedidoAcompanhamentoComponent` não usado)
  já existia e não é erro.

## Armadilhas conhecidas

- **ng-motion 0.5.0, `useTransform` com várias entradas:** `useTransform([a, b], fn)` chama
  `fn(valorA, valorB)` com argumentos separados, e NÃO `fn([valorA, valorB])`. Escreva
  `(a: number, b: number) => ...`. Usar `([a, b]) =>` quebra em runtime ("não é iterável")
  e o build não acusa, porque o tipo é `any[]`. O exemplo da skill do ng-motion está errado
  para esta versão.
- **Python com heredoc no Git Bash (Windows)** costuma falhar: escreva o script em um arquivo
  e rode depois.

## Boas práticas de Angular (guia oficial do Angular)

Use as regras abaixo em **código novo**. Parte do código existente ainda não segue todas
(por exemplo, `@HostListener`, `@Input`, `standalone: true` e `CommonModule`). Não refatore
código existente só para seguir este guia, a menos que a pessoa peça.

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

### TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

### Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

### Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

### State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

### Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

### Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection
