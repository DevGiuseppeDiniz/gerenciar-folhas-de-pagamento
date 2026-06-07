import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FolhaPagamento } from '../../models/folha-pagamento.model';
import {
  NOME_FUNCIONARIO_MAX,
  validarNomeFuncionario,
} from '../../models/folha-pagamento.rules';

@Component({
  selector: 'app-folha-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="fechar.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">{{ folha ? 'Editar Folha' : 'Nova Folha de Pagamento' }}</h2>
          <button type="button" class="btn btn-ghost btn-sm" aria-label="Fechar" (click)="fechar.emit()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="nomeFuncionario" class="form-label">
              Nome do Funcionário <span class="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="nomeFuncionario"
              class="form-input"
              [class.is-invalid]="erro"
              [(ngModel)]="nomeFuncionario"
              (ngModelChange)="validar()"
              placeholder="Digite o nome do funcionário"
              [attr.maxlength]="nomeMaximo"
              (keyup.enter)="onSalvar()" />
            @if (erro) {
              <p class="form-error">{{ erro }}</p>
            }
            <p class="form-hint">{{ nomeFuncionario.length }}/{{ nomeMaximo }} caracteres</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="fechar.emit()">Cancelar</button>
          <button
            type="button"
            class="btn btn-primary"
            (click)="onSalvar()"
            [disabled]="!!validarNomeAtual()">
            {{ folha ? 'Salvar Alterações' : 'Criar Folha' }}
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
  `]
})
export class FolhaFormComponent implements OnInit {
  @Input() folha: FolhaPagamento | null = null;
  @Output() salvar = new EventEmitter<string>();
  @Output() fechar = new EventEmitter<void>();

  nomeFuncionario = '';
  erro = '';
  readonly nomeMaximo = NOME_FUNCIONARIO_MAX;

  ngOnInit(): void {
    if (this.folha) {
      this.nomeFuncionario = this.folha.nomeFuncionario;
    }
  }

  validar(): void {
    this.erro = this.validarNomeAtual();
  }

  validarNomeAtual(): string {
    return validarNomeFuncionario(this.nomeFuncionario);
  }

  onSalvar(): void {
    this.validar();
    if (!this.erro) {
      this.salvar.emit(this.nomeFuncionario.trim());
    }
  }
}
