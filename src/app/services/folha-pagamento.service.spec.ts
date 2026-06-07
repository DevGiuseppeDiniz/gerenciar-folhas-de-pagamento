import { FolhaPagamentoService } from './folha-pagamento.service';

describe('FolhaPagamentoService', () => {
  let service: FolhaPagamentoService;

  beforeEach(() => {
    localStorage.clear();
    service = new FolhaPagamentoService();
  });

  it('cria, edita e remove uma folha', () => {
    const folha = service.criar('  Maria Silva  ');

    expect(folha.nomeFuncionario).toBe('Maria Silva');
    expect(service.atualizar(folha.id, 'Maria Souza')).toBeTrue();
    expect(service.obterPorId(folha.id)?.nomeFuncionario).toBe('Maria Souza');
    expect(service.remover(folha.id)).toBeTrue();
    expect(service.obterPorId(folha.id)).toBeUndefined();
  });

  it('bloqueia alterações em folhas fechadas e permite reabri-las', () => {
    const folha = service.criar('Maria Silva');
    const item = service.adicionarItem(folha.id, {
      descricao: 'Salário',
      tipo: 'entrada',
      valor: 3000,
    });

    expect(item).not.toBeNull();
    expect(service.fechar(folha.id)).toBeTrue();
    expect(service.atualizar(folha.id, 'Outro nome')).toBeFalse();
    expect(service.adicionarItem(folha.id, {
      descricao: 'Bônus',
      tipo: 'entrada',
      valor: 100,
    })).toBeNull();
    expect(service.removerItem(folha.id, item!.id)).toBeFalse();
    expect(service.reabrir(folha.id)).toBeTrue();
    expect(service.removerItem(folha.id, item!.id)).toBeTrue();
  });

  it('não fecha uma folha cujo total líquido seja zero ou negativo', () => {
    const folha = service.criar('Maria Silva');
    service.adicionarItem(folha.id, {
      descricao: 'Salário',
      tipo: 'entrada',
      valor: 1000,
    });
    service.adicionarItem(folha.id, {
      descricao: 'Desconto',
      tipo: 'desconto',
      valor: 1000,
    });

    expect(service.fechar(folha.id)).toBeFalse();
    expect(service.obterPorId(folha.id)?.status).toBe('aberta');
  });

  it('rejeita dados inválidos mesmo quando o serviço é chamado diretamente', () => {
    expect(() => service.criar('A')).toThrowError(/3 caracteres/);

    const folha = service.criar('Maria Silva');
    expect(() => service.adicionarItem(folha.id, {
      descricao: 'A',
      tipo: 'entrada',
      valor: 100,
    })).toThrowError(/2 caracteres/);
  });
});
