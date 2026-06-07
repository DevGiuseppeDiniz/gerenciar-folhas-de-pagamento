import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FolhaPagamento, Item, ItemTipo } from '../../models/folha-pagamento.model';
import { FolhaPagamentoService } from '../../services/folha-pagamento.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { ItemFormComponent } from '../item-form/item-form.component';

@Component({
  selector: 'app-folha-detalhes',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent, ItemFormComponent],
  template: `
    <div class="modal-backdrop" (click)="fechar.emit()">
      <div class="modal detalhes-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-info">
            <h2 class="modal-title">{{ folha.nomeFuncionario }}</h2>
            <span
              class="badge"
              [class.badge-warning]="folha.status === 'aberta'"
              [class.badge-success]="folha.status === 'fechada'">
              {{ folha.status === 'aberta' ? 'Em Aberto' : 'Fechada' }}
            </span>
          </div>
          <button class="btn btn-ghost btn-sm" (click)="fechar.emit()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="resumo-financeiro">
            <div class="resumo-card entradas">
              <div class="resumo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14"/>
                  <path d="m5 12 7-7 7 7"/>
                </svg>
              </div>
              <div class="resumo-content">
                <span class="resumo-label">Total Entradas</span>
                <span class="resumo-valor">{{ calcularTotalEntradas() | currency:'BRL' }}</span>
              </div>
            </div>
            <div class="resumo-card descontos">
              <div class="resumo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 19V5"/>
                  <path d="m5 12 7 7 7-7"/>
                </svg>
              </div>
              <div class="resumo-content">
                <span class="resumo-label">Total Descontos</span>
                <span class="resumo-valor">{{ calcularTotalDescontos() | currency:'BRL' }}</span>
              </div>
            </div>
            <div class="resumo-card liquido">
              <div class="resumo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                  <path d="M12 18V6"/>
                </svg>
              </div>
              <div class="resumo-content">
                <span class="resumo-label">Total Líquido</span>
                <span class="resumo-valor" [class.positivo]="calcularTotalLiquido() > 0" [class.negativo]="calcularTotalLiquido() < 0">
                  {{ calcularTotalLiquido() | currency:'BRL' }}
                </span>
              </div>
            </div>
          </div>

          <div class="itens-section">
            <div class="itens-header">
              <h3>Itens da Folha</h3>
              <button *ngIf="folha.status === 'aberta'" class="btn btn-primary btn-sm" (click)="abrirFormItem()">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Adicionar Item
              </button>
            </div>

            <div *ngIf="folha.itens.length === 0" class="empty-itens">
              <p>Nenhum item adicionado ainda.</p>
              <button *ngIf="folha.status === 'aberta'" class="btn btn-outline btn-sm mt-2" (click)="abrirFormItem()">
                Adicionar Primeiro Item
              </button>
            </div>

            <div *ngIf="folha.itens.length > 0" class="itens-lista">
              <div *ngFor="let item of folha.itens" class="item-row">
                <div class="item-info">
                  <span
                    class="item-tipo"
                    [class.entrada]="item.tipo === 'entrada'"
                    [class.desconto]="item.tipo === 'desconto'">
                    {{ item.tipo === 'entrada' ? 'E' : 'D' }}
                  </span>
                  <span class="item-descricao">{{ item.descricao }}</span>
                </div>
                <div class="item-valor-acoes">
                  <span
                    class="item-valor"
                    [class.text-success]="item.tipo === 'entrada'"
                    [class.text-destructive]="item.tipo === 'desconto'">
                    {{ item.tipo === 'desconto' ? '-' : '+' }}{{ item.valor | currency:'BRL' }}
                  </span>
                  <div *ngIf="folha.status === 'aberta'" class="item-acoes">
                    <button
                      class="btn btn-ghost btn-sm"
                      title="Editar"
                      (click)="abrirFormItem(item)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      class="btn btn-ghost btn-sm"
                      title="Excluir"
                      (click)="confirmarExclusaoItem(item)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            *ngIf="folha.status === 'aberta'"
            class="btn btn-primary"
            [disabled]="!podeFechar()"
            [title]="!podeFechar() ? 'O total líquido deve ser maior que zero' : ''"
            (click)="confirmarFechamento()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            Fechar Folha
          </button>
          <button *ngIf="folha.status === 'fechada'" class="btn btn-secondary" (click)="confirmarReabertura()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            Reabrir Folha
          </button>
        </div>
      </div>
    </div>

    <app-item-form
      *ngIf="mostrarFormItem"
      [item]="itemEditando"
      (salvar)="salvarItem($event)"
      (fechar)="fecharFormItem()">
    </app-item-form>

    <app-confirm-modal
      *ngIf="itemParaExcluir"
      titulo="Excluir Item"
      [mensagem]="getMensagemExclusaoItem()"
      confirmText="Excluir"
      confirmClass="btn-destructive"
      (confirmar)="excluirItem()"
      (cancelar)="cancelarExclusaoItem()">
    </app-confirm-modal>

    <app-confirm-modal
      *ngIf="mostrarConfirmFechamento"
      titulo="Fechar Folha"
      mensagem="Ao fechar a folha, não será possível adicionar, editar ou remover itens. Deseja continuar?"
      confirmText="Fechar Folha"
      confirmClass="btn-primary"
      (confirmar)="fecharFolha()"
      (cancelar)="cancelarFechamento()">
    </app-confirm-modal>

    <app-confirm-modal
      *ngIf="mostrarConfirmReabertura"
      titulo="Reabrir Folha"
      mensagem="Deseja reabrir esta folha de pagamento? Você poderá editar os itens novamente."
      confirmText="Reabrir"
      confirmClass="btn-primary"
      (confirmar)="reabrirFolha()"
      (cancelar)="cancelarReabertura()">
    </app-confirm-modal>
  `,
  styles: [`
    .detalhes-modal {
      max-width: 600px;
      max-height: 90vh;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .resumo-financeiro {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .resumo-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem;
      border-radius: var(--radius);
    }

    .resumo-card.entradas {
      background-color: #dcfce7;
    }

    .resumo-card.entradas .resumo-icon {
      color: #16a34a;
    }

    .resumo-card.descontos {
      background-color: #fee2e2;
    }

    .resumo-card.descontos .resumo-icon {
      color: #dc2626;
    }

    .resumo-card.liquido {
      background-color: #dbeafe;
    }

    .resumo-card.liquido .resumo-icon {
      color: #2563eb;
    }

    .resumo-content {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .resumo-label {
      font-size: 0.625rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted-foreground);
    }

    .resumo-valor {
      font-size: 0.875rem;
      font-weight: 700;
    }

    .resumo-valor.positivo {
      color: #16a34a;
    }

    .resumo-valor.negativo {
      color: #dc2626;
    }

    .itens-section {
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }

    .itens-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.875rem 1rem;
      background-color: var(--secondary);
      border-bottom: 1px solid var(--border);
    }

    .itens-header h3 {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .empty-itens {
      padding: 2rem;
      text-align: center;
      color: var(--muted-foreground);
      font-size: 0.875rem;
    }

    .itens-lista {
      max-height: 300px;
      overflow-y: auto;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border);
    }

    .item-row:last-child {
      border-bottom: none;
    }

    .item-row:hover {
      background-color: var(--secondary);
    }

    .item-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .item-tipo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-size: 0.625rem;
      font-weight: 700;
    }

    .item-tipo.entrada {
      background-color: #dcfce7;
      color: #16a34a;
    }

    .item-tipo.desconto {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .item-descricao {
      font-size: 0.875rem;
    }

    .item-valor-acoes {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .item-valor {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .item-acoes {
      display: flex;
      gap: 0.25rem;
    }

    @media (max-width: 640px) {
      .resumo-financeiro {
        grid-template-columns: 1fr;
      }

      .item-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .item-valor-acoes {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class FolhaDetalhesComponent {
  @Input() folha!: FolhaPagamento;
  @Output() fechar = new EventEmitter<void>();
  @Output() atualizada = new EventEmitter<void>();

  private folhaService = inject(FolhaPagamentoService);

  mostrarFormItem = false;
  itemEditando: Item | null = null;
  itemParaExcluir: Item | null = null;
  mostrarConfirmFechamento = false;
  mostrarConfirmReabertura = false;

  calcularTotalEntradas(): number {
    return this.folhaService.calcularTotalEntradas(this.folha);
  }

  calcularTotalDescontos(): number {
    return this.folhaService.calcularTotalDescontos(this.folha);
  }

  calcularTotalLiquido(): number {
    return this.folhaService.calcularTotalLiquido(this.folha);
  }

  podeFechar(): boolean {
    return this.calcularTotalLiquido() > 0;
  }

  getMensagemExclusaoItem(): string {
    return this.itemParaExcluir
      ? 'Tem certeza que deseja excluir o item "' + this.itemParaExcluir.descricao + '"?'
      : '';
  }

  abrirFormItem(item?: Item): void {
    this.itemEditando = item || null;
    this.mostrarFormItem = true;
  }

  fecharFormItem(): void {
    this.mostrarFormItem = false;
    this.itemEditando = null;
  }

  salvarItem(dados: { descricao: string; tipo: ItemTipo; valor: number }): void {
    if (this.itemEditando) {
      this.folhaService.atualizarItem(this.folha.id, this.itemEditando.id, dados);
    } else {
      this.folhaService.adicionarItem(this.folha.id, dados);
    }
    this.fecharFormItem();
    this.atualizada.emit();
  }

  confirmarExclusaoItem(item: Item): void {
    this.itemParaExcluir = item;
  }

  cancelarExclusaoItem(): void {
    this.itemParaExcluir = null;
  }

  excluirItem(): void {
    if (this.itemParaExcluir) {
      this.folhaService.removerItem(this.folha.id, this.itemParaExcluir.id);
      this.itemParaExcluir = null;
      this.atualizada.emit();
    }
  }

  confirmarFechamento(): void {
    this.mostrarConfirmFechamento = true;
  }

  cancelarFechamento(): void {
    this.mostrarConfirmFechamento = false;
  }

  fecharFolha(): void {
    this.folhaService.fechar(this.folha.id);
    this.mostrarConfirmFechamento = false;
    this.atualizada.emit();
  }

  confirmarReabertura(): void {
    this.mostrarConfirmReabertura = true;
  }

  cancelarReabertura(): void {
    this.mostrarConfirmReabertura = false;
  }

  reabrirFolha(): void {
    this.folhaService.reabrir(this.folha.id);
    this.mostrarConfirmReabertura = false;
    this.atualizada.emit();
  }
}
