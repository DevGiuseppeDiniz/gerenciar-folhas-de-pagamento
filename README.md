# Gestão de Folhas de Pagamento

Aplicação Angular criada para o teste técnico de desenvolvedor frontend. O projeto permite gerenciar folhas de pagamento e seus itens, aplicando as regras de negócio solicitadas.

## Funcionalidades

- Criar, listar, editar e remover folhas de pagamento.
- Filtrar folhas por status.
- Adicionar, editar e remover entradas e descontos.
- Calcular entradas, descontos e total líquido.
- Fechar apenas folhas com total líquido maior que zero.
- Bloquear alterações em folhas fechadas e permitir sua reabertura.
- Persistir os dados localmente no navegador.

## Regras implementadas

- Nome do funcionário obrigatório, entre 3 e 200 caracteres.
- Descrição do item obrigatória, entre 2 e 50 caracteres.
- Tipo e valor do item obrigatórios.
- Valor do item maior que zero.
- Nome e itens não podem ser alterados em folhas fechadas.

## Executando o projeto

Requisitos: Node.js 20 ou 22 e pnpm.

```bash
pnpm install
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Validação

```bash
pnpm build
pnpm test
```
