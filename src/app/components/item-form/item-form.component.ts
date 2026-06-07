import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Item, ItemTipo } from '../../models/folha-pagamento.model';
import {
  DESCRICAO_ITEM_MAX,
  validarDescricaoItem,
  validarTipoItem,
  validarValorItem,
} from '../../models/folha-pagamento.rules';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="fechar.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">{{ item ? 'Editar Item' : 'Novo Item' }}</h2>
          <button type="button" class="btn btn-ghost btn-sm" aria-label="Fechar" (click)="fechar.emit()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="descricao" class="form-label">
              Descrição <span class="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="descricao"
              class="form-input"
              [class.is-invalid]="erros.descricao"
              [(ngModel)]="descricao"
              (ngModelChange)="validarDescricao()"
              placeholder="Ex: Salário Base"
              [attr.maxlength]="descricaoMaxima" />
            @if (erros.descricao) {
              <p class="form-error">{{ erros.descricao }}</p>
            }
            <p class="form-hint">{{ descricao.length }}/{{ descricaoMaxima }} caracteres</p>
          </div>

          <div class="form-group">
            <label for="tipo" class="form-label">
              Tipo <span class="text-destructive">*</span>
            </label>
            <select
              id="tipo"
              class="form-select"
              [(ngModel)]="tipo"
              (ngModelChange)="validarTipo()">
              <option value="">Selecione o tipo</option>
              <option value="entrada">Entrada</option>
              <option value="desconto">Desconto</option>
            </select>
            @if (erros.tipo) {
              <p class="form-error">{{ erros.tipo }}</p>
            }
          </div>

          <div class="form-group">
            <label for="valor" class="form-label">
              Valor <span class="text-destructive">*</span>
            </label>
            <div class="input-with-prefix">
              <span class="input-prefix">R$</span>
              <input
                type="number"
                id="valor"
                class="form-input input-valor"
                [class.is-invalid]="erros.valor"
                [(ngModel)]="valor"
                (ngModelChange)="validarValor()"
                placeholder="0,00"
                min="0.01"
                step="0.01" />
            </div>
            @if (erros.valor) {
              <p class="form-error">{{ erros.valor }}</p>
            }
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="fechar.emit()">Cancelar</button>
          <button
            type="button"
            class="btn btn-primary"
            (click)="onSalvar()"
            [disabled]="!formularioValido()">
            {{ item ? 'Salvar Alterações' : 'Adicionar Item' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-hint {
      font-size: 0.75rem;
      color: var(--muted-foreground);
      margin-top: 0.25rem;
    }

    .input-with-prefix {
      display: flex;
      align-items: stretch;
    }

    .input-prefix {
      display: flex;
      align-items: center;
      padding: 0 0.75rem;
      background-color: var(--secondary);
      border: 1px solid var(--input);
      border-right: none;
      border-radius: var(--radius) 0 0 var(--radius);
      font-size: 0.875rem;
      color: var(--muted-foreground);
    }

    .input-valor {
      border-radius: 0 var(--radius) var(--radius) 0;
    }
  `]
})
export class ItemFormComponent implements OnInit {
  @Input() item: Item | null = null;
  @Output() salvar = new EventEmitter<{ descricao: string; tipo: ItemTipo; valor: number }>();
  @Output() fechar = new EventEmitter<void>();

  descricao = '';
  tipo: ItemTipo | '' = '';
  valor: number | null = null;
  readonly descricaoMaxima = DESCRICAO_ITEM_MAX;

  erros = {
    descricao: '',
    tipo: '',
    valor: '',
  };

  ngOnInit(): void {
    if (this.item) {
      this.descricao = this.item.descricao;
      this.tipo = this.item.tipo;
      this.valor = this.item.valor;
    }
  }

  validarDescricao(): void {
    this.erros.descricao = validarDescricaoItem(this.descricao);
  }

  validarTipo(): void {
    this.erros.tipo = validarTipoItem(this.tipo);
  }

  validarValor(): void {
    this.erros.valor = validarValorItem(this.valor);
  }

  validarTodos(): void {
    this.validarDescricao();
    this.validarTipo();
    this.validarValor();
  }

  formularioValido(): boolean {
    return (
      !validarDescricaoItem(this.descricao) &&
      !validarTipoItem(this.tipo) &&
      !validarValorItem(this.valor)
    );
  }

  onSalvar(): void {
    this.validarTodos();

    if (this.formularioValido() && this.tipo && this.valor !== null) {
      this.salvar.emit({
        descricao: this.descricao.trim(),
        tipo: this.tipo,
        valor: this.valor,
      });
    }
  }
}
