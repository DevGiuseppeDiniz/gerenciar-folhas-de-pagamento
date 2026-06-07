import { fakeAsync, tick } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { FolhaPagamento } from '../models/folha-pagamento.model';
import { FolhaPagamentoService } from './folha-pagamento.service';

describe('FolhaPagamentoService', () => {
  let service: FolhaPagamentoService;

  beforeEach(() => {
    localStorage.clear();
    service = new FolhaPagamentoService();
    spyOn(Math, 'random').and.returnValue(0);
  });

  it('aguarda a latência mínima antes de alterar os dados', fakeAsync(() => {
    let folhaCriada: FolhaPagamento | undefined;
    service.criar('Maria Silva').subscribe((folha) => folhaCriada = folha);

    tick(399);
    expect(folhaCriada).toBeUndefined();

    let folhasAntesDaResposta: FolhaPagamento[] = [];
    service.folhas$.subscribe((folhas) => folhasAntesDaResposta = folhas);
    expect(folhasAntesDaResposta).toEqual([]);

    tick(1);
    expect(folhaCriada?.nomeFuncionario).toBe('Maria Silva');
    expect(folhasAntesDaResposta.length).toBe(1);
  }));

  it('limita a latência aleatória a 900 ms', fakeAsync(() => {
    (Math.random as jasmine.Spy).and.returnValue(0.999999);
    let folhaCriada: FolhaPagamento | undefined;
    service.criar('Maria Silva').subscribe((folha) => folhaCriada = folha);

    tick(899);
    expect(folhaCriada).toBeUndefined();

    tick(1);
    expect(folhaCriada?.nomeFuncionario).toBe('Maria Silva');
  }));

  it('cria, edita e remove uma folha de forma assíncrona', fakeAsync(() => {
    const folha = executar(service.criar('  Maria Silva  '));

    expect(folha.nomeFuncionario).toBe('Maria Silva');
    expect(executar(service.atualizar(folha.id, 'Maria Souza'))).toBeTrue();
    expect(executar(service.obterPorId(folha.id))?.nomeFuncionario).toBe('Maria Souza');
    expect(executar(service.remover(folha.id))).toBeTrue();
    expect(executar(service.obterPorId(folha.id))).toBeUndefined();
  }));

  it('bloqueia alterações em folhas fechadas e permite reabri-las', fakeAsync(() => {
    const folha = executar(service.criar('Maria Silva'));
    const item = executar(service.adicionarItem(folha.id, {
      descricao: 'Salário',
      tipo: 'entrada',
      valor: 3000,
    }));

    expect(item).not.toBeNull();
    expect(executar(service.fechar(folha.id))).toBeTrue();
    expect(executar(service.atualizar(folha.id, 'Outro nome'))).toBeFalse();
    expect(executar(service.adicionarItem(folha.id, {
      descricao: 'Bônus',
      tipo: 'entrada',
      valor: 100,
    }))).toBeNull();
    expect(executar(service.removerItem(folha.id, item!.id))).toBeFalse();
    expect(executar(service.reabrir(folha.id))).toBeTrue();
    expect(executar(service.removerItem(folha.id, item!.id))).toBeTrue();
  }));

  it('não fecha uma folha cujo total líquido seja zero ou negativo', fakeAsync(() => {
    const folha = executar(service.criar('Maria Silva'));
    executar(service.adicionarItem(folha.id, {
      descricao: 'Salário',
      tipo: 'entrada',
      valor: 1000,
    }));
    executar(service.adicionarItem(folha.id, {
      descricao: 'Desconto',
      tipo: 'desconto',
      valor: 1000,
    }));

    expect(executar(service.fechar(folha.id))).toBeFalse();
    expect(executar(service.obterPorId(folha.id))?.status).toBe('aberta');
  }));

  it('entrega erros de validação pelo Observable', fakeAsync(() => {
    let erroNome: unknown;
    service.criar('A').subscribe({ error: (erro) => erroNome = erro });
    tick(400);
    expect(erroNome).toEqual(jasmine.any(Error));
    expect((erroNome as Error).message).toContain('3 caracteres');

    const folha = executar(service.criar('Maria Silva'));
    let erroItem: unknown;
    service.adicionarItem(folha.id, {
      descricao: 'A',
      tipo: 'entrada',
      valor: 100,
    }).subscribe({ error: (erro) => erroItem = erro });
    tick(400);
    expect((erroItem as Error).message).toContain('2 caracteres');
  }));

  function executar<T>(observable: Observable<T>): T {
    let resultado!: T;
    let erroOperacao: unknown;

    observable.subscribe({
      next: (valor) => resultado = valor,
      error: (erro) => erroOperacao = erro,
    });
    tick(400);

    if (erroOperacao) throw erroOperacao;
    return resultado;
  }
});
