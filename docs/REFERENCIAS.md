# Referências usadas neste material

Consulta realizada em **28/10/2026**. Os exemplos deste repositório foram escritos para estudar padrões; os projetos consultados podem receber alterações. O enunciado e o JSON da prova continuam sendo a fonte de verdade para os requisitos.

## Repositórios fornecidos

### Pokédex de barskosa

- [Repositório](https://github.com/barskosa/pokedex).
- [Estados e integração em App.jsx](https://github.com/barskosa/pokedex/blob/main/src/App.jsx): pesquisa, filtros combinados, favorito, item selecionado e componentes que recebem funções por props.
- [Importação do JSON e regras de busca em pokedex.js](https://github.com/barskosa/pokedex/blob/main/src/data/pokedex.js): normalização de texto, busca por ID, filtro com `every`/`some`, ordenação e tratamento de lista de tipos vazia.
- [Relacionamentos em Trainers.jsx](https://github.com/barskosa/pokedex/blob/main/src/components/Trainers.jsx): transformar uma lista de IDs em registros de outra coleção; manter a ordem e as repetições de cada equipe.

Aplicação neste material: catálogo local, busca/filtros, favoritos, detalhes e coleções relacionadas por IDs. Nomes de funções e estrutura foram adaptados para um domínio genérico de itens.

### Projetos React do professor João Paulo Aramuni

[Diretório React consultado](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/tree/main/PROJETOS/React). Foram selecionados os projetos abaixo pela relação com listagens e manipulação de dados.

| Projeto e arquivos lidos | Padrão aproveitado |
| --- | --- |
| [Pokédex — README](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/blob/main/PROJETOS/React/Pokedex/README.md) e [usePokedexFilters.js](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/blob/main/PROJETOS/React/Pokedex/src/hooks/usePokedexFilters.js) | Guardar os filtros no estado e calcular a lista exibida a partir dos dados. |
| [CandidatosTSE_React — README](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/blob/main/PROJETOS/React/CandidatosTSE_React/README.md), [candidatosTseService.js](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/blob/main/PROJETOS/React/CandidatosTSE_React/src/services/candidatosTseService.js) e [useCandidatos.js](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/blob/main/PROJETOS/React/CandidatosTSE_React/src/hooks/useCandidatos.js) | Combinar filtros, obter valores distintos para um select e representar carregamento/erro. |
| [ConsultaBrasil — README](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/blob/main/PROJETOS/React/ConsultaBrasil/README.md), [useRequest.js](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/blob/main/PROJETOS/React/ConsultaBrasil/src/hooks/useRequest.js) e [useSavedAddresses.js](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/blob/main/PROJETOS/React/ConsultaBrasil/src/hooks/useSavedAddresses.js) | Cancelar requisições antigas, permitir nova tentativa e salvar dados no navegador. |

O projeto de candidatos lê CSV. Aqui o padrão de apresentação e filtragem foi aplicado a JSON, sem adicionar o leitor de CSV. A Pokédex do professor possui integração com Supabase; este material mantém as operações locais. Use somente o que estiver permitido e pedido na prova.

## Documentação oficial consultada

- [React — Rendering Lists](https://react.dev/learn/rendering-lists): `map`, `filter` e chaves de listas.
- [React — Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state): atualizar coleções criando novos arrays e objetos.
- [React — useEffect](https://react.dev/reference/react/useEffect): dependências, sincronização e função de limpeza.
- [Vite — JSON](https://vite.dev/guide/features.html#json): importar um arquivo JSON no código do projeto.

Os exemplos de formulário, paginação e resumo numérico são complementos didáticos para exercitar esses fundamentos; sua presença não significa que serão cobrados na prova.
