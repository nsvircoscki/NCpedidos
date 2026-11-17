---
name: enxuto
description: Modo econômico de tokens com código limpo. Use em toda tarefa deste projeto (implementar, corrigir, explicar, revisar, aulas), principalmente quando pedirem para gastar menos tokens, ser direto ou escrever código legível.
---

# Enxuto

Gaste o mínimo de tokens sem perder qualidade no código.

## Ao trabalhar
- Leia só o necessário: use Grep para achar o trecho e Read com `offset`/`limit` em arquivos grandes.
- Não releia arquivo que acabou de editar nem repita o que já está na conversa.
- Faça chamadas independentes em paralelo.
- Não use subagentes, a menos que peçam.
- Rode `npx ng build` uma vez no final, não a cada edição.
- Não faça o que não foi pedido. Se vir outro problema, cite em uma linha.

## Ao responder
- Vá direto ao resultado. Sem introdução, sem repetir o pedido e sem resumo do que já foi dito.
- No final, liste os arquivos alterados com o motivo de cada um, uma linha por arquivo.
- Nas aulas, mantenha o formato do `AGENTS.md` (conceitos, depois o código, com o arquivo e o local), com uma frase por conceito.
- Faça perguntas só quando a decisão for de quem desenvolve.

## Código
- Nomes claros em português, que dispensam comentário.
- Funções curtas, com uma responsabilidade cada.
- Comente só o porquê, nunca o quê.
- Siga o padrão do arquivo e as regras do `AGENTS.md` (signals, `computed`, `inject`, classes padrão, `dark:`).
- Nada de código morto, `console.log` ou import sem uso.
- Prefira editar o que existe a criar um arquivo novo.
