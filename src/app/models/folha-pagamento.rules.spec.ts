import { FolhaPagamento } from './folha-pagamento.model';
import {
  calcularTotalDescontos,
  calcularTotalEntradas,
  calcularTotalLiquido,
  podeFecharFolha,
  validarDescricaoItem,
  validarNomeFuncionario,
  validarTipoItem,
  validarValorItem,
} from './folha-pagamento.rules';

describe('Regras da folha de pagamento', () => {
  it('valida os limites do nome do funcionário', () => {
    expect(validarNomeFuncionario('  ')).toContain('obrigatório');
    expect(validarNomeFuncionario('Ab')).toContain('3 caracteres');
    expect(validarNomeFuncionario('Ana')).toBe('');
    expect(validarNomeFuncionario('A'.repeat(200))).toBe('');
    expect(validarNomeFuncionario('A'.repeat(201))).toContain('200 caracteres');
  });

  it('valida todos os campos de um item', () => {
    expect(validarDescricaoItem('A')).toContain('2 caracteres');
    expect(validarDescricaoItem('A'.repeat(51))).toContain('50 caracteres');
    expect(validarDescricaoItem('Salário base')).toBe('');
    expect(validarTipoItem('')).toContain('obrigatório');
    expect(validarTipoItem('entrada')).toBe('');
    expect(validarValorItem(null)).toContain('obrigatório');
    expect(validarValorItem(0)).toContain('maior que zero');
    expect(validarValorItem(0.01)).toBe('');
  });

  it('calcula entradas, descontos e total líquido', () => {
    const folha = criarFolha();

    expect(calcularTotalEntradas(folha)).toBe(3500);
    expect(calcularTotalDescontos(folha)).toBe(750);
    expect(calcularTotalLiquido(folha)).toBe(2750);
    expect(podeFecharFolha(folha)).toBeTrue();
  });

  it('impede o fechamento quando o total líquido não é positivo', () => {
    const folha = criarFolha();
    folha.itens = [
      { id: '1', descricao: 'Salário', tipo: 'entrada', valor: 1000 },
      { id: '2', descricao: 'Desconto', tipo: 'desconto', valor: 1000 },
    ];

    expect(podeFecharFolha(folha)).toBeFalse();
  });
});

function criarFolha(): FolhaPagamento {
  return {
    id: 'folha-1',
    nomeFuncionario: 'Ana Souza',
    status: 'aberta',
    itens: [
      { id: '1', descricao: 'Salário', tipo: 'entrada', valor: 3000 },
      { id: '2', descricao: 'Bônus', tipo: 'entrada', valor: 500 },
      { id: '3', descricao: 'INSS', tipo: 'desconto', valor: 750 },
    ],
    criadaEm: new Date('2026-06-01T12:00:00Z'),
    atualizadaEm: new Date('2026-06-01T12:00:00Z'),
  };
}
