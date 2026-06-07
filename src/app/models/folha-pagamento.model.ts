export type ItemTipo = 'entrada' | 'desconto';

export interface Item {
  id: string;
  descricao: string;
  tipo: ItemTipo;
  valor: number;
}

export type FolhaStatus = 'aberta' | 'fechada';

export interface FolhaPagamento {
  id: string;
  nomeFuncionario: string;
  status: FolhaStatus;
  itens: Item[];
  criadaEm: Date;
  atualizadaEm: Date;
}

export function gerarId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
