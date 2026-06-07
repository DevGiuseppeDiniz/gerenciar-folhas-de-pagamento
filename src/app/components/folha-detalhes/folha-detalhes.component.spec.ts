import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { FolhaPagamento, Item } from '../../models/folha-pagamento.model';
import { FolhaPagamentoService } from '../../services/folha-pagamento.service';
import { FolhaDetalhesComponent } from './folha-detalhes.component';

describe('FolhaDetalhesComponent', () => {
  let fixture: ComponentFixture<FolhaDetalhesComponent>;
  let component: FolhaDetalhesComponent;
  let service: jasmine.SpyObj<FolhaPagamentoService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<FolhaPagamentoService>(
      'FolhaPagamentoService',
      [
        'adicionarItem',
        'atualizarItem',
        'removerItem',
        'fechar',
        'reabrir',
        'calcularTotalEntradas',
        'calcularTotalDescontos',
        'calcularTotalLiquido',
      ]
    );
    service.calcularTotalEntradas.and.returnValue(3000);
    service.calcularTotalDescontos.and.returnValue(300);
    service.calcularTotalLiquido.and.returnValue(2700);

    await TestBed.configureTestingModule({
      imports: [FolhaDetalhesComponent],
      providers: [{ provide: FolhaPagamentoService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(FolhaDetalhesComponent);
    component = fixture.componentInstance;
    component.folha = criarFolha();
    fixture.detectChanges();
  });

  it('exibe os totais calculados e permite fechar folha positiva', () => {
    expect(component.calcularTotalEntradas()).toBe(3000);
    expect(component.calcularTotalDescontos()).toBe(300);
    expect(component.calcularTotalLiquido()).toBe(2700);
    expect(component.podeFechar()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('R$');
  });

  it('adiciona item e notifica a atualização após sucesso', () => {
    const item = criarItem();
    const atualizada = spyOn(component.atualizada, 'emit');
    service.adicionarItem.and.returnValue(of(item));

    component.salvarItem({
      descricao: item.descricao,
      tipo: item.tipo,
      valor: item.valor,
    });

    expect(service.adicionarItem).toHaveBeenCalledWith('folha-1', {
      descricao: 'Salário',
      tipo: 'entrada',
      valor: 3000,
    });
    expect(atualizada).toHaveBeenCalled();
    expect(component.mostrarFormItem).toBeFalse();
  });

  it('edita o item selecionado', () => {
    const item = criarItem();
    component.itemEditando = item;
    component.mostrarFormItem = true;
    service.atualizarItem.and.returnValue(of(true));

    component.salvarItem({
      descricao: 'Salário atualizado',
      tipo: 'entrada',
      valor: 3200,
    });

    expect(service.atualizarItem).toHaveBeenCalledOnceWith(
      'folha-1',
      'item-1',
      {
        descricao: 'Salário atualizado',
        tipo: 'entrada',
        valor: 3200,
      }
    );
    expect(component.itemEditando).toBeNull();
  });

  it('remove um item confirmado', () => {
    component.itemParaExcluir = criarItem();
    const atualizada = spyOn(component.atualizada, 'emit');
    service.removerItem.and.returnValue(of(true));

    component.excluirItem();

    expect(service.removerItem).toHaveBeenCalledOnceWith('folha-1', 'item-1');
    expect(component.itemParaExcluir).toBeNull();
    expect(atualizada).toHaveBeenCalled();
  });

  it('fecha e reabre a folha após respostas bem-sucedidas', () => {
    const atualizada = spyOn(component.atualizada, 'emit');
    component.mostrarConfirmFechamento = true;
    component.mostrarConfirmReabertura = true;
    service.fechar.and.returnValue(of(true));
    service.reabrir.and.returnValue(of(true));

    component.fecharFolha();
    component.reabrirFolha();

    expect(service.fechar).toHaveBeenCalledOnceWith('folha-1');
    expect(service.reabrir).toHaveBeenCalledOnceWith('folha-1');
    expect(component.mostrarConfirmFechamento).toBeFalse();
    expect(component.mostrarConfirmReabertura).toBeFalse();
    expect(atualizada).toHaveBeenCalledTimes(2);
  });

  it('bloqueia chamadas duplicadas enquanto uma operação está pendente', () => {
    const resposta = new Subject<boolean>();
    service.fechar.and.returnValue(resposta);

    component.fecharFolha();
    component.fecharFolha();

    expect(service.fechar).toHaveBeenCalledTimes(1);
    expect(component.processando).toBeTrue();

    resposta.next(true);
    resposta.complete();

    expect(component.processando).toBeFalse();
  });

  it('exibe o erro retornado pela operação', () => {
    service.reabrir.and.returnValue(
      throwError(() => new Error('Falha ao reabrir'))
    );

    component.reabrirFolha();

    expect(component.erroOperacao).toBe('Falha ao reabrir');
    expect(component.processando).toBeFalse();
  });
});

function criarFolha(): FolhaPagamento {
  return {
    id: 'folha-1',
    nomeFuncionario: 'Maria Silva',
    status: 'aberta',
    itens: [],
    criadaEm: new Date('2026-06-01T12:00:00Z'),
    atualizadaEm: new Date('2026-06-01T12:00:00Z'),
  };
}

function criarItem(): Item {
  return {
    id: 'item-1',
    descricao: 'Salário',
    tipo: 'entrada',
    valor: 3000,
  };
}
