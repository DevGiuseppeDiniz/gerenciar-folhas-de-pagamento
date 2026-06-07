import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, NgClass],
  template: `
    <div class="modal-backdrop" (click)="cancelar.emit()">
      <div
        class="modal confirm-modal"
        role="alertdialog"
        aria-modal="true"
        [attr.aria-labelledby]="'confirm-title'"
        (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 id="confirm-title" class="modal-title">{{ titulo }}</h2>
        </div>
        <div class="modal-body">
          <p>{{ mensagem }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="cancelar.emit()">Cancelar</button>
          <button
            type="button"
            class="btn"
            [ngClass]="confirmClass"
            (click)="confirmar.emit()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-modal {
      max-width: 400px;
    }

    .confirm-modal p {
      color: var(--muted-foreground);
      line-height: 1.6;
    }
  `]
})
export class ConfirmModalComponent {
  @Input() titulo = 'Confirmar';
  @Input() mensagem = 'Tem certeza que deseja continuar?';
  @Input() confirmText = 'Confirmar';
  @Input() confirmClass = 'btn-primary';
  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
}
