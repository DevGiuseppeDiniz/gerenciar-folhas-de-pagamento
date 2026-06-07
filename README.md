# Gestão de Folhas de Pagamento

Aplicação Angular desenvolvida para um teste técnico de frontend. O sistema permite cadastrar folhas de pagamento, gerenciar entradas e descontos, calcular o total líquido e controlar o fechamento das folhas.

## Demonstração

A aplicação publicada pode ser acessada pela URL configurada na Vercel.

Para avaliar o código e executar o projeto localmente, siga as instruções abaixo.

## Funcionalidades

- Criar, listar, editar e remover folhas de pagamento.
- Filtrar folhas pelo status "Em Aberto" ou "Fechada".
- Adicionar, editar e remover entradas e descontos.
- Exibir os totais de entradas, descontos e o valor líquido.
- Fechar apenas folhas cujo total líquido seja maior que zero.
- Bloquear alterações no nome e nos itens de folhas fechadas.
- Reabrir folhas para permitir novas alterações.
- Persistir os dados no `localStorage` do navegador.

## Regras de negócio

- O nome do funcionário é obrigatório e deve ter entre 3 e 200 caracteres.
- A descrição do item é obrigatória e deve ter entre 2 e 50 caracteres.
- O tipo do item deve ser `Entrada` ou `Desconto`.
- O valor do item deve ser maior que zero.
- Folhas fechadas não permitem alteração do funcionário ou dos itens.
- Uma folha só pode ser fechada quando seu total líquido for positivo.

## Tecnologias

- Angular 19.2.25
- TypeScript 5.7.3
- RxJS 7.8.2
- Jasmine e Karma
- SCSS
- pnpm 10.12.1

## Versões do ambiente

Para tornar a instalação reproduzível, o projeto fixa:

- Node.js 22.14.0 nos arquivos `.nvmrc` e `.node-version`.
- pnpm 10.12.1 no campo `packageManager` do `package.json`.
- Todas as dependências com versões exatas.
- A árvore completa de dependências no `pnpm-lock.yaml`.

Não apague o `pnpm-lock.yaml` e não substitua o comando de instalação recomendado por outro gerenciador de pacotes.

## Pré-requisitos

Instale os seguintes programas:

1. [Git](https://git-scm.com/downloads)
2. [Node.js 22.14.0](https://nodejs.org/)
3. Google Chrome ou Chromium, necessário para os testes unitários

Confirme as versões:

```bash
node --version
corepack --version
git --version
```

O resultado de `node --version` deve ser `v22.14.0`.

## Configuração do pnpm

O Corepack acompanha o Node.js 22 e instala a versão de pnpm declarada pelo projeto:

```bash
corepack enable
corepack prepare pnpm@10.12.1 --activate
pnpm --version
```

O último comando deve exibir `10.12.1`.

Caso o sistema não permita executar `corepack enable` sem privilégios, abra o terminal como administrador ou instale a versão fixada diretamente:

```bash
npm install --global pnpm@10.12.1
```

## Clonando o projeto

```bash
git clone https://github.com/DevGiuseppeDiniz/gerenciar-folhas-de-pagamento.git
cd gerenciar-folhas-de-pagamento
```

Usuários de `nvm`, `nvm-windows`, `fnm` ou `asdf` podem selecionar a versão indicada por `.nvmrc` ou `.node-version` antes de instalar as dependências.

## Instalando as dependências

Use o lockfile para instalar exatamente a árvore de dependências validada:

```bash
pnpm install --frozen-lockfile
```

O parâmetro `--frozen-lockfile` impede alterações silenciosas no lockfile e encerra a instalação caso `package.json` e `pnpm-lock.yaml` estejam inconsistentes.

## Executando localmente

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000).

Para encerrar o servidor, pressione `Ctrl+C` no terminal.

## Executando os testes

Com o Google Chrome ou Chromium instalado:

```bash
pnpm test
```

Os testes são executados uma única vez em modo headless. Eles cobrem as principais validações, cálculos e restrições de folhas fechadas.

## Gerando o build de produção

```bash
pnpm build
```

Os arquivos gerados ficam em `dist/folha-pagamento`.

## Validação completa

Antes de enviar alterações, execute:

```bash
pnpm check
```

Esse comando executa os testes e, somente se eles passarem, gera o build de produção.

## Teste manual sugerido

1. Crie uma folha informando o nome de um funcionário.
2. Adicione uma entrada, por exemplo, salário de `R$ 3.000,00`.
3. Adicione um desconto, por exemplo, INSS de `R$ 300,00`.
4. Confirme que o total líquido exibido é `R$ 2.700,00`.
5. Edite um item e confirme que os totais são recalculados.
6. Feche a folha e confirme que nome e itens ficam bloqueados.
7. Reabra a folha e confirme que a edição volta a ser permitida.
8. Use o filtro da listagem para alternar entre folhas abertas e fechadas.

## Limpeza dos dados locais

Os dados são armazenados no `localStorage`. Para reiniciar a aplicação:

1. Abra as ferramentas do desenvolvedor do navegador.
2. Acesse `Application` > `Local Storage`.
3. Selecione `http://localhost:3000`.
4. Remova a chave `folhas_pagamento` ou limpe o armazenamento do site.

## Solução de problemas

### Versão incompatível do Node.js

Se a instalação informar erro de `engine`, confirme:

```bash
node --version
```

Use o Node.js 22.14.0 e abra um novo terminal após trocar a versão.

### pnpm com versão diferente

```bash
corepack prepare pnpm@10.12.1 --activate
pnpm --version
```

### Porta 3000 ocupada

Encerre o processo que utiliza a porta ou execute temporariamente:

```bash
pnpm ng serve --port 4200
```

Depois acesse `http://localhost:4200`.

### Chrome não encontrado durante os testes

Instale o Google Chrome ou defina a variável `CHROME_BIN` com o caminho do executável do Chrome/Chromium.

### Instalação local inconsistente

Remova somente `node_modules` e reinstale usando o lockfile:

```bash
pnpm install --frozen-lockfile
```

## Estrutura principal

```text
src/app/
├── components/   # Listagem, formulários, detalhes e confirmações
├── models/       # Tipos, validações e cálculos de negócio
└── services/     # Estado, persistência e operações das folhas
```

## Scripts disponíveis

| Comando | Finalidade |
| --- | --- |
| `pnpm dev` | Inicia o servidor local na porta 3000 |
| `pnpm test` | Executa os testes unitários no Chrome Headless |
| `pnpm build` | Gera o build otimizado de produção |
| `pnpm check` | Executa testes e build em sequência |
| `pnpm watch` | Recompila o projeto ao detectar alterações |
