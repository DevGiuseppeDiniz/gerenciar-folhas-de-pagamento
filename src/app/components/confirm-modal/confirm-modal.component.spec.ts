import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ConfirmModalComponent } from './confirm-modal.component';

describe('ConfirmModalComponent', () => {
  let fixture: ComponentFixture<ConfirmModalComponent>;
  let component: ConfirmModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
  });

  it('renderiza título, mensagem, texto e classe de confirmação', () => {
    component.titulo = 'Excluir folha';
    component.mensagem = 'Esta ação não pode ser desfeita.';
    component.confirmText = 'Excluir';
    component.confirmClass = 'btn-destructive';
    fixture.detectChanges();

    const dialogo = fixture.debugElement.query(By.css('[role="alertdialog"]'));
    const botaoConfirmar = fixture.debugElement.queryAll(By.css('.modal-footer button'))[1];

    expect(dialogo).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Excluir folha');
    expect(fixture.nativeElement.textContent).toContain('Esta ação não pode ser desfeita.');
    expect(botaoConfirmar.nativeElement.textContent.trim()).toBe('Excluir');
    expect(botaoConfirmar.nativeElement.classList).toContain('btn-destructive');
  });

  it('emite confirmação e cancelamento pelos botões', () => {
    const confirmar = spyOn(component.confirmar, 'emit');
    const cancelar = spyOn(component.cancelar, 'emit');
    fixture.detectChanges();

    const botoes = fixture.debugElement.queryAll(By.css('.modal-footer button'));
    botoes[0].triggerEventHandler('click');
    botoes[1].triggerEventHandler('click');

    expect(cancelar).toHaveBeenCalled();
    expect(confirmar).toHaveBeenCalled();
  });

  it('cancela ao clicar no backdrop, mas não ao clicar no diálogo', () => {
    const cancelar = spyOn(component.cancelar, 'emit');
    fixture.detectChanges();

    fixture.debugElement.query(By.css('.modal-backdrop')).triggerEventHandler('click');
    expect(cancelar).toHaveBeenCalledTimes(1);

    const evento = jasmine.createSpyObj<MouseEvent>('MouseEvent', ['stopPropagation']);
    fixture.debugElement.query(By.css('.confirm-modal')).triggerEventHandler('click', evento);

    expect(evento.stopPropagation).toHaveBeenCalled();
    expect(cancelar).toHaveBeenCalledTimes(1);
  });
});
