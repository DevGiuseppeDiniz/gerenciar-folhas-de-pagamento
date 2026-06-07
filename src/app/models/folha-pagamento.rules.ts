import { FolhaPagamento, Item, ItemTipo } from './folha-pagamento.model';

export const NOME_FUNCIONARIO_MIN = 3;
export const NOME_FUNCIONARIO_MAX = 200;
export const DESCRICAO_ITEM_MIN = 2;
export const DESCRICAO_ITEM_MAX = 50;

export function validarNomeFuncionario(nome: string): string {
  const nomeNormalizado = nome.trim();

  if (!nomeNormalizado) return 'O nome do funcionário é obrigatório.';
  if (nomeNormalizado.length < NOME_FUNCIONARIO_MIN) {
    return `O nome deve ter pelo menos ${NOME_FUNCIONARIO_MIN} caracteres.`;
  }
  if (nomeNormalizado.length > NOME_FUNCIONARIO_MAX) {
    return `O nome não pode ter mais de ${NOME_FUNCIONARIO_MAX} caracteres.`;
  }

  return '';
}

export function validarDescricaoItem(descricao: string): string {
  const descricaoNormalizada = descricao.trim();

  if (!descricaoNormalizada) return 'A descrição é obrigatória.';
  if (descricaoNormalizada.length < DESCRICAO_ITEM_MIN) {
    return `A descrição deve ter pelo menos ${DESCRICAO_ITEM_MIN} caracteres.`;
  }
  if (descricaoNormalizada.length > DESCRICAO_ITEM_MAX) {
    return `A descrição não pode ter mais de ${DESCRICAO_ITEM_MAX} caracteres.`;
  }

  return '';
}

export function validarTipoItem(tipo: ItemTipo | ''): string {
  return tipo === 'entrada' || tipo === 'desconto'
    ? ''
    : 'O tipo é obrigatório.';
}

export function validarValorItem(valor: number | null): string {
  if (valor === null || !Number.isFinite(valor)) {
    return 'O valor é obrigatório.';
  }

  return valor > 0 ? '' : 'O valor deve ser maior que zero.';
}

export function calcularTotalEntradas(folha: FolhaPagamento): number {
  return somarItensPorTipo(folha.itens, 'entrada');
}

export function calcularTotalDescontos(folha: FolhaPagamento): number {
  return somarItensPorTipo(folha.itens, 'desconto');
}

export function calcularTotalLiquido(folha: FolhaPagamento): number {
  return calcularTotalEntradas(folha) - calcularTotalDescontos(folha);
}

export function podeFecharFolha(folha: FolhaPagamento): boolean {
  return calcularTotalLiquido(folha) > 0;
}

function somarItensPorTipo(itens: Item[], tipo: ItemTipo): number {
  return itens
    .filter((item) => item.tipo === tipo)
    .reduce((total, item) => total + item.valor, 0);
}
