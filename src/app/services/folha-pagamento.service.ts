import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
  FolhaPagamento,
  FolhaStatus,
  Item,
  ItemTipo,
  gerarId,
} from '../models/folha-pagamento.model';
import {
  calcularTotalDescontos,
  calcularTotalEntradas,
  calcularTotalLiquido,
  podeFecharFolha,
  validarDescricaoItem,
  validarNomeFuncionario,
  validarTipoItem,
  validarValorItem,
} from '../models/folha-pagamento.rules';

@Injectable({
  providedIn: 'root',
})
export class FolhaPagamentoService {
  private readonly STORAGE_KEY = 'folhas_pagamento';
  private readonly folhasSubject = new BehaviorSubject<FolhaPagamento[]>([]);
  readonly folhas$ = this.folhasSubject.asObservable();

  constructor() {
    this.carregarDoStorage();
  }

  obterTodas(): Observable<FolhaPagamento[]> {
    return this.folhas$;
  }

  obterPorStatus(status: FolhaStatus | 'todas'): Observable<FolhaPagamento[]> {
    return this.folhas$.pipe(
      map((folhas) =>
        status === 'todas' ? folhas : folhas.filter((folha) => folha.status === status)
      )
    );
  }

  obterPorId(id: string): FolhaPagamento | undefined {
    return this.folhasSubject.value.find((folha) => folha.id === id);
  }

  criar(nomeFuncionario: string): FolhaPagamento {
    this.validarNome(nomeFuncionario);
    const agora = new Date();
    const novaFolha: FolhaPagamento = {
      id: gerarId(),
      nomeFuncionario: nomeFuncionario.trim(),
      status: 'aberta',
      itens: [],
      criadaEm: agora,
      atualizadaEm: agora,
    };

    this.folhasSubject.next([...this.folhasSubject.value, novaFolha]);
    this.salvarNoStorage();
    return novaFolha;
  }

  atualizar(id: string, nomeFuncionario: string): boolean {
    this.validarNome(nomeFuncionario);
    const folha = this.obterPorId(id);
    if (!folha || folha.status === 'fechada') return false;

    this.atualizarFolha(id, { nomeFuncionario: nomeFuncionario.trim() });
    this.salvarNoStorage();
    return true;
  }

  remover(id: string): boolean {
    const folhas = this.folhasSubject.value.filter((folha) => folha.id !== id);
    if (folhas.length === this.folhasSubject.value.length) return false;

    this.folhasSubject.next(folhas);
    this.salvarNoStorage();
    return true;
  }

  fechar(id: string): boolean {
    const folha = this.obterPorId(id);
    if (!folha || folha.status === 'fechada' || !podeFecharFolha(folha)) {
      return false;
    }

    this.atualizarFolha(id, { status: 'fechada' });
    this.salvarNoStorage();
    return true;
  }

  reabrir(id: string): boolean {
    const folha = this.obterPorId(id);
    if (!folha || folha.status === 'aberta') return false;

    this.atualizarFolha(id, { status: 'aberta' });
    this.salvarNoStorage();
    return true;
  }

  adicionarItem(folhaId: string, item: Omit<Item, 'id'>): Item | null {
    this.validarItem(item);
    const folha = this.obterPorId(folhaId);
    if (!folha || folha.status === 'fechada') return null;

    const novoItem: Item = {
      id: gerarId(),
      descricao: item.descricao.trim(),
      tipo: item.tipo,
      valor: item.valor,
    };

    this.atualizarFolha(folhaId, { itens: [...folha.itens, novoItem] });
    this.salvarNoStorage();
    return novoItem;
  }

  atualizarItem(
    folhaId: string,
    itemId: string,
    dados: Partial<Omit<Item, 'id'>>
  ): boolean {
    const folha = this.obterPorId(folhaId);
    if (!folha || folha.status === 'fechada') return false;

    const itemAtual = folha.itens.find((item) => item.id === itemId);
    if (!itemAtual) return false;

    const itemAtualizado = { ...itemAtual, ...dados };
    this.validarItem(itemAtualizado);
    this.atualizarFolha(folhaId, {
      itens: folha.itens.map((item) =>
        item.id === itemId
          ? { ...itemAtualizado, descricao: itemAtualizado.descricao.trim() }
          : item
      ),
    });
    this.salvarNoStorage();
    return true;
  }

  removerItem(folhaId: string, itemId: string): boolean {
    const folha = this.obterPorId(folhaId);
    if (!folha || folha.status === 'fechada') return false;

    const itens = folha.itens.filter((item) => item.id !== itemId);
    if (itens.length === folha.itens.length) return false;

    this.atualizarFolha(folhaId, { itens });
    this.salvarNoStorage();
    return true;
  }

  calcularTotalEntradas(folha: FolhaPagamento): number {
    return calcularTotalEntradas(folha);
  }

  calcularTotalDescontos(folha: FolhaPagamento): number {
    return calcularTotalDescontos(folha);
  }

  calcularTotalLiquido(folha: FolhaPagamento): number {
    return calcularTotalLiquido(folha);
  }

  private atualizarFolha(
    id: string,
    alteracoes: Partial<Pick<FolhaPagamento, 'nomeFuncionario' | 'status' | 'itens'>>
  ): void {
    this.folhasSubject.next(
      this.folhasSubject.value.map((folha) =>
        folha.id === id
          ? { ...folha, ...alteracoes, atualizadaEm: new Date() }
          : folha
      )
    );
  }

  private validarNome(nomeFuncionario: string): void {
    const erro = validarNomeFuncionario(nomeFuncionario);
    if (erro) throw new Error(erro);
  }

  private validarItem(item: Pick<Item, 'descricao' | 'tipo' | 'valor'>): void {
    const erro =
      validarDescricaoItem(item.descricao) ||
      validarTipoItem(item.tipo) ||
      validarValorItem(item.valor);

    if (erro) throw new Error(erro);
  }

  private carregarDoStorage(): void {
    const dados = localStorage.getItem(this.STORAGE_KEY);
    if (!dados) return;

    try {
      this.folhasSubject.next(this.normalizarFolhas(JSON.parse(dados)));
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
      this.folhasSubject.next([]);
    }
  }

  private salvarNoStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.folhasSubject.value));
  }

  private normalizarFolhas(valor: unknown): FolhaPagamento[] {
    if (!Array.isArray(valor)) return [];

    return valor.flatMap((folha): FolhaPagamento[] => {
      if (!this.folhaArmazenadaValida(folha)) return [];

      return [{
        id: folha.id,
        nomeFuncionario: folha.nomeFuncionario.trim(),
        status: folha.status,
        itens: folha.itens.map((item) => ({
          id: item.id,
          descricao: item.descricao.trim(),
          tipo: item.tipo,
          valor: item.valor,
        })),
        criadaEm: new Date(folha.criadaEm),
        atualizadaEm: new Date(folha.atualizadaEm),
      }];
    });
  }

  private folhaArmazenadaValida(valor: unknown): valor is FolhaArmazenada {
    if (!valor || typeof valor !== 'object') return false;
    const folha = valor as Record<string, unknown>;

    if (
      typeof folha['id'] !== 'string' ||
      typeof folha['nomeFuncionario'] !== 'string' ||
      validarNomeFuncionario(folha['nomeFuncionario']) ||
      (folha['status'] !== 'aberta' && folha['status'] !== 'fechada') ||
      !Array.isArray(folha['itens']) ||
      Number.isNaN(Date.parse(String(folha['criadaEm']))) ||
      Number.isNaN(Date.parse(String(folha['atualizadaEm'])))
    ) {
      return false;
    }

    return folha['itens'].every((valorItem) => {
      if (!valorItem || typeof valorItem !== 'object') return false;
      const item = valorItem as Record<string, unknown>;
      return (
        typeof item['id'] === 'string' &&
        typeof item['descricao'] === 'string' &&
        !validarDescricaoItem(item['descricao']) &&
        (item['tipo'] === 'entrada' || item['tipo'] === 'desconto') &&
        typeof item['valor'] === 'number' &&
        !validarValorItem(item['valor'])
      );
    });
  }
}

interface FolhaArmazenada {
  id: string;
  nomeFuncionario: string;
  status: FolhaStatus;
  itens: Array<{
    id: string;
    descricao: string;
    tipo: ItemTipo;
    valor: number;
  }>;
  criadaEm: string;
  atualizadaEm: string;
}
