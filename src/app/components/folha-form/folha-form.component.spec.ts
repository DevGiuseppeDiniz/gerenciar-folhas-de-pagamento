import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FolhaPagamento } from '../../models/folha-pagamento.model';
import { FolhaFormComponent } from './folha-form.component';

describe('FolhaFormComponent', () => {
  let fixture: ComponentFixture<FolhaFormComponent>;
  let component: FolhaFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FolhaFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FolhaFormComponent);
    component = fixture.componentInstance;
  });

  it('preenche o nome ao editar uma folha', () => {
    component.folha = criarFolha();
    fixture.detectChanges();

    expect(component.nomeFuncionario).toBe('Maria Silva');
    expect(fixture.nativeElement.textContent).toContain('Editar Folha');
  });

  it('não emite um nome inválido e exibe a validação', () => {
    const salvar = spyOn(component.salvar, 'emit');
    component.nomeFuncionario = 'A';

    component.onSalvar();
    fixture.detectChanges();

    expect(salvar).not.toHaveBeenCalled();
    expect(component.erro).toContain('3 caracteres');
    expect(fixture.nativeElement.textContent).toContain('3 caracteres');
  });

  it('emite o nome válido sem espaços nas extremidades', () => {
    const salvar = spyOn(component.salvar, 'emit');
    component.nomeFuncionario = '  Maria Souza  ';

    component.onSalvar();

    expect(salvar).toHaveBeenCalledOnceWith('Maria Souza');
  });

  it('emite fechar ao clicar em cancelar', () => {
    const fechar = spyOn(component.fechar, 'emit');
    fixture.detectChanges();

    const botoes = fixture.debugElement.queryAll(By.css('.modal-footer button'));
    botoes[0].triggerEventHandler('click');

    expect(fechar).toHaveBeenCalled();
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
