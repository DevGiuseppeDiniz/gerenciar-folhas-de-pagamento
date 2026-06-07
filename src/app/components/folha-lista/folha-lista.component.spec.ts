import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { FolhaPagamento } from '../../models/folha-pagamento.model';
import { FolhaPagamentoService } from '../../services/folha-pagamento.service';
import { FolhaListaComponent } from './folha-lista.component';

describe('FolhaListaComponent', () => {
  let fixture: ComponentFixture<FolhaListaComponent>;
  let component: FolhaListaComponent;
  let folhas$: BehaviorSubject<FolhaPagamento[]>;
  let service: jasmine.SpyObj<FolhaPagamentoService>;

  beforeEach(async () => {
    folhas$ = new BehaviorSubject<FolhaPagamento[]>([]);
    service = jasmine.createSpyObj<FolhaPagamentoService>(
      'FolhaPagamentoService',
      [
        'obterTodas',
        'obterPorId',
        'criar',
        'atualizar',
        'remover',
        'calcularTotalEntradas',
        'calcularTotalDescontos',
        'calcularTotalLiquido',
      ]
    );
    service.obterTodas.and.returnValue(folhas$);
    service.calcularTotalEntradas.and.callFake(calcularEntradas);
    service.calcularTotalDescontos.and.callFake(calcularDescontos);
    service.calcularTotalLiquido.and.callFake(
      (folha) => calcularEntradas(folha) - calcularDescontos(folha)
    );

    await TestBed.configureTestingModule({
      imports: [FolhaListaComponent],
      providers: [{ provide: FolhaPagamentoService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(FolhaListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => folhas$.complete());

  it('carrega, ordena por atualização e filtra pelo status', () => {
    const folhaAntiga = criarFolha('1', 'Ana', 'aberta', '2026-06-01T10:00:00Z');
    const folhaRecente = criarFolha('2', 'Bruno', 'fechada', '2026-06-03T10:00:00Z');

    folhas$.next([folhaAntiga, folhaRecente]);

    expect(component.carregandoLista).toBeFalse();
    expect(component.folhasFiltradas.map((folha) => folha.id)).toEqual(['2', '1']);

    component.filtroStatus = 'aberta';
    component.aplicarFiltro();

    expect(component.folhasFiltradas).toEqual([folhaAntiga]);
  });

  it('cria uma folha e fecha o formulário após a resposta', () => {
    service.criar.and.returnValue(of(criarFolha('1', 'Maria', 'aberta')));
    component.abrirFormNova();

    component.salvarFolha('Maria');

    expect(service.criar).toHaveBeenCalledOnceWith('Maria');
    expect(component.mostrarFormFolha).toBeFalse();
    expect(component.processando).toBeFalse();
  });

  it('mantém o formulário aberto quando a edição não é permitida', () => {
    const folha = criarFolha('1', 'Maria', 'fechada');
    service.atualizar.and.returnValue(of(false));
    component.abrirFormEditar(folha);

    component.salvarFolha('Maria Souza');

    expect(service.atualizar).toHaveBeenCalledOnceWith('1', 'Maria Souza');
    expect(component.mostrarFormFolha).toBeTrue();
    expect(component.erroOperacao).toContain('atualizar');
  });

  it('remove a folha confirmada', () => {
    component.folhaParaExcluir = criarFolha('1', 'Maria', 'aberta');
    service.remover.and.returnValue(of(true));

    component.excluirFolha();

    expect(service.remover).toHaveBeenCalledOnceWith('1');
    expect(component.folhaParaExcluir).toBeNull();
  });

  it('atualiza a folha selecionada e trata erros de operação', () => {
    const folha = criarFolha('1', 'Maria', 'aberta');
    const folhaAtualizada = { ...folha, nomeFuncionario: 'Maria Souza' };
    component.folhaSelecionada = folha;
    service.obterPorId.and.returnValue(of(folhaAtualizada));

    component.atualizarFolhaSelecionada();

    expect(component.folhaSelecionada).toEqual(folhaAtualizada);

    service.remover.and.returnValue(throwError(() => new Error('Falha simulada')));
    component.folhaParaExcluir = folha;
    component.excluirFolha();

    expect(component.erroOperacao).toBe('Falha simulada');
    expect(component.processando).toBeFalse();
  });

  it('cancela as assinaturas ao destruir o componente', () => {
    component.ngOnDestroy();
    folhas$.next([criarFolha('1', 'Maria', 'aberta')]);

    expect(component.folhas).toEqual([]);
  });
});

function criarFolha(
  id: string,
  nomeFuncionario: string,
  status: 'aberta' | 'fechada',
  atualizadaEm = '2026-06-01T12:00:00Z'
): FolhaPagamento {
  return {
    id,
    nomeFuncionario,
    status,
    itens: [],
    criadaEm: new Date('2026-06-01T12:00:00Z'),
    atualizadaEm: new Date(atualizadaEm),
  };
}

function calcularEntradas(folha: FolhaPagamento): number {
  return folha.itens
    .filter((item) => item.tipo === 'entrada')
    .reduce((total, item) => total + item.valor, 0);
}

function calcularDescontos(folha: FolhaPagamento): number {
  return folha.itens
    .filter((item) => item.tipo === 'desconto')
    .reduce((total, item) => total + item.valor, 0);
}
