---
name: reutilizar
description: Antes de criar função, componente, service, tipo ou classe CSS, procurar se já existe algo igual ou parecido no projeto e reaproveitar. Use em toda tarefa que escreve código neste projeto (implementar, corrigir, aulas), principalmente ao criar algo novo.
---

# Reutilizar antes de criar

Código novo só quando nada do projeto resolve. Repetir lógica é o que mais suja este código.

## Antes de escrever algo novo
1. Procure pelo nome e pela ideia (Grep em `src/app`), não só pelo nome exato:
   `formatar`, `buscar`, `filtrar`, `validar`, `selecionar`, o nome do campo ou do dado.
2. Confira primeiro o que o projeto já tem (lista abaixo e `AGENTS.md`).
3. Achou algo parecido? Use. Se faltar pouco, estenda (um `input()` novo, um parâmetro)
   em vez de copiar.
4. Viu a mesma lógica em 2 lugares ou mais? Extraia para um lugar comum e troque nos dois.
5. Só então crie, no lugar certo:
   - peça visual usada em mais de uma tela → `components/`
   - dados e estado compartilhados → o store da área em `services/`
   - função pura sem estado (conta, validação, formatação) → arquivo próprio
     (ex.: `validacoes/`), nunca copiada dentro de componentes
   - formato de dados → `models/`
   - estilo repetido → `@utility` em `src/styles.scss`

## O que já existe (confira antes de criar)
- **Componentes:** `seletor-cliente`, `esqueleto-lista` (lista e grade), `amostra-tinta` (KPI),
  `filtro-modal` + `filtro-chips`, `erro-campo` (erro de Signal Forms).
- **Stores:** `ClientesStore` (`paraSelecao`), `PreCadastrosStore`, `TabelasPrecoStore`,
  `ProdutoService`, `PedidosStore`. Ler e alterar dados sempre por eles.
- **Funções:** `carregarExemplo()` (`services/carregar-exemplo.ts`), `validarCPF`/`validarCNPJ`
  (`validacoes/documentos.ts`), `PedidoPdfService` (`enviarAoCliente`, `baixar`).
- **Classes CSS:** `cartao`, `botao-acao`, `botao-acao-secundario`, `botao-pop`, `label-input`,
  `status-pill`, `sobretitulo`, `titulo-pagina`, `subtitulo-pagina`, `titulo-secao`, `titulo-cartao`.

## Ao terminar
- Ao listar os arquivos alterados, diga o que foi reaproveitado e, se criou algo novo,
  por que nada existente servia.
- Criou algo reutilizável? Acrescente na lista acima e em "Componentes e classes padrão" do `AGENTS.md`.
