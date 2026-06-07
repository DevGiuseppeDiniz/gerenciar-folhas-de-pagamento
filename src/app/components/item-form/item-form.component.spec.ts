import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Item } from '../../models/folha-pagamento.model';
import { ItemFormComponent } from './item-form.component';

describe('ItemFormComponent', () => {
  let fixture: ComponentFixture<ItemFormComponent>;
  let component: ItemFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemFormComponent);
    component = fixture.componentInstance;
  });

  it('preenche os campos ao editar um item', () => {
    component.item = criarItem();
    fixture.detectChanges();

    expect(component.descricao).toBe('Salário base');
    expect(component.tipo).toBe('entrada');
    expect(component.valor).toBe(3000);
    expect(fixture.nativeElement.textContent).toContain('Editar Item');
  });

  it('valida descrição, tipo e valor obrigatórios', () => {
    component.onSalvar();
    fixture.detectChanges();

    expect(component.erros.descricao).toContain('obrigatória');
    expect(component.erros.tipo).toContain('obrigatório');
    expect(component.erros.valor).toContain('obrigatório');
    expect(component.formularioValido()).toBeFalse();
  });

  it('não emite dados inválidos', () => {
    const salvar = spyOn(component.salvar, 'emit');
    component.descricao = 'A';
    component.tipo = 'entrada';
    component.valor = 0;

    component.onSalvar();

    expect(salvar).not.toHaveBeenCalled();
  });

  it('emite um item válido com descrição normalizada', () => {
    const salvar = spyOn(component.salvar, 'emit');
    component.descricao = '  Bônus  ';
    component.tipo = 'entrada';
    component.valor = 500;

    component.onSalvar();

    expect(salvar).toHaveBeenCalledOnceWith({
      descricao: 'Bônus',
      tipo: 'entrada',
      valor: 500,
    });
  });
});

function criarItem(): Item {
  return {
    id: 'item-1',
    descricao: 'Salário base',
    tipo: 'entrada',
    valor: 3000,
  };
}
