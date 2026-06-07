import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription, finalize, map, take } from 'rxjs';
import { FolhaPagamentoService } from '../../services/folha-pagamento.service';
import { FolhaPagamento, FolhaStatus } from '../../models/folha-pagamento.model';
import { FolhaFormComponent } from '../folha-form/folha-form.component';
import { FolhaDetalhesComponent } from '../folha-detalhes/folha-detalhes.component';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-folha-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FolhaFormComponent,
    FolhaDetalhesComponent,
    ConfirmModalComponent,
  ],
  template: `
    @if (erroOperacao) {
      <div class="alert-error" role="alert">{{ erroOperacao }}</div>
    }

    <div class="lista-header">
      <div class="lista-titulo">
        <h2>Folhas de Pagamento</h2>
        <span class="lista-contador">{{ folhasFiltradas.length }} {{ folhasFiltradas.length === 1 ? 'folha' : 'folhas' }}</span>
      </div>
      <div class="lista-acoes">
        <div class="filtro-grupo">
          <label for="filtroStatus" class="filtro-label">Filtrar por status:</label>
          <select
            id="filtroStatus"
            class="form-select filtro-select"
            [(ngModel)]="filtroStatus"
            (ngModelChange)="aplicarFiltro()">
            <option value="todas">Todas</option>
            <option value="aberta">Em Aberto</option>
            <option value="fechada">Fechada</option>
          </select>
        </div>
        <button class="btn btn-primary" [disabled]="processando" (click)="abrirFormNova()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Nova Folha
        </button>
      </div>
    </div>

    @if (carregandoLista) {
      <div class="loading-state card" role="status">
        Carregando folhas...
      </div>
    } @else if (folhasFiltradas.length === 0) {
      <div class="empty-state card">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
        </div>
        <h3>Nenhuma folha encontrada</h3>
        @if (filtroStatus !== 'todas') {
          <p>Não há folhas com status "{{ filtroStatus === 'aberta' ? 'Em Aberto' : 'Fechada' }}".</p>
        } @else {
          <p>Comece criando uma nova folha de pagamento.</p>
        }
        <button class="btn btn-primary mt-4" (click)="abrirFormNova()">Criar Primeira Folha</button>
      </div>
    } @else {
      <div class="folhas-grid">
        @for (folha of folhasFiltradas; track folha.id) {
          <div class="folha-card card" (click)="abrirDetalhes(folha)">
            <div class="folha-card-header">
              <div class="folha-info">
                <h3 class="folha-nome">{{ folha.nomeFuncionario }}</h3>
                <span
                  class="badge"
                  [class.badge-warning]="folha.status === 'aberta'"
                  [class.badge-success]="folha.status === 'fechada'">
                  {{ folha.status === 'aberta' ? 'Em Aberto' : 'Fechada' }}
                </span>
              </div>
              <div class="folha-acoes" (click)="$event.stopPropagation()">
                <button
                  class="btn btn-ghost btn-sm"
                  title="Editar"
                  [disabled]="folha.status === 'fechada'"
                  (click)="abrirFormEditar(folha)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  class="btn btn-ghost btn-sm text-destructive"
                  title="Excluir"
                  (click)="confirmarExclusao(folha)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="folha-card-body">
              <div class="folha-resumo">
                <div class="resumo-item">
                  <span class="resumo-label">Itens</span>
                  <span class="resumo-valor">{{ folha.itens.length }}</span>
                </div>
                <div class="resumo-item">
                  <span class="resumo-label">Entradas</span>
                  <span class="resumo-valor text-success">{{ calcularTotalEntradas(folha) | currency:'BRL' }}</span>
                </div>
                <div class="resumo-item">
                  <span class="resumo-label">Descontos</span>
                  <span class="resumo-valor text-destructive">{{ calcularTotalDescontos(folha) | currency:'BRL' }}</span>
                </div>
              </div>
              <div class="folha-total">
                <span class="total-label">Total Líquido</span>
                <span class="total-valor" [class.text-success]="calcularTotalLiquido(folha) > 0" [class.text-destructive]="calcularTotalLiquido(folha) < 0">
                  {{ calcularTotalLiquido(folha) | currency:'BRL' }}
                </span>
              </div>
            </div>
            <div class="folha-card-footer">
              <span class="folha-data">Atualizada em {{ folha.atualizadaEm | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
          </div>
        }
      </div>
    }

    @if (mostrarFormFolha) {
      <app-folha-form
        [folha]="folhaEditando"
        (salvar)="salvarFolha($event)"
        (fechar)="fecharForm()" />
    }

    @if (folhaSelecionada) {
      <app-folha-detalhes
        [folha]="folhaSelecionada"
        (fechar)="fecharDetalhes()"
        (atualizada)="atualizarFolhaSelecionada()" />
    }

    @if (folhaParaExcluir) {
      <app-confirm-modal
        titulo="Excluir Folha"
        [mensagem]="'Tem certeza que deseja excluir a folha de pagamento de ' + folhaParaExcluir.nomeFuncionario + '? Esta ação não pode ser desfeita.'"
        confirmText="Excluir"
        confirmClass="btn-destructive"
        (confirmar)="excluirFolha()"
        (cancelar)="folhaParaExcluir = null" />
    }
  `,
  styles: [`
    .alert-error {
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      color: #991b1b;
      background-color: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: var(--radius);
      font-size: 0.875rem;
    }

    .lista-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .lista-titulo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .lista-titulo h2 {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .lista-contador {
      font-size: 0.75rem;
      color: var(--muted-foreground);
      background-color: var(--secondary);
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
    }

    .lista-acoes {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filtro-grupo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filtro-label {
      font-size: 0.875rem;
      color: var(--muted-foreground);
      white-space: nowrap;
    }

    .filtro-select {
      min-width: 150px;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
    }

    .loading-state {
      padding: 2rem;
      text-align: center;
      color: var(--muted-foreground);
      font-size: 0.875rem;
    }

    .empty-icon {
      color: var(--muted-foreground);
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: var(--muted-foreground);
      font-size: 0.875rem;
    }

    .folhas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1rem;
    }

    .folha-card {
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .folha-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .folha-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border);
    }

    .folha-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .folha-nome {
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.25;
    }

    .folha-acoes {
      display: flex;
      gap: 0.25rem;
    }

    .folha-card-body {
      padding: 1rem 1.25rem;
    }

    .folha-resumo {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }

    .resumo-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .resumo-label {
      font-size: 0.75rem;
      color: var(--muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .resumo-valor {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .folha-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .total-label {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .total-valor {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .folha-card-footer {
      padding: 0.75rem 1.25rem;
      border-top: 1px solid var(--border);
      background-color: var(--secondary);
    }

    .folha-data {
      font-size: 0.75rem;
      color: var(--muted-foreground);
    }

    @media (max-width: 640px) {
      .lista-header {
        flex-direction: column;
        align-items: stretch;
      }

      .lista-acoes {
        flex-direction: column;
        align-items: stretch;
      }

      .filtro-grupo {
        flex-direction: column;
        align-items: stretch;
      }

      .folhas-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FolhaListaComponent implements OnInit, OnDestroy {
  private folhaService = inject(FolhaPagamentoService);
  private readonly subscriptions = new Subscription();

  folhas: FolhaPagamento[] = [];
  folhasFiltradas: FolhaPagamento[] = [];
  filtroStatus: FolhaStatus | 'todas' = 'todas';

  mostrarFormFolha = false;
  folhaEditando: FolhaPagamento | null = null;
  folhaSelecionada: FolhaPagamento | null = null;
  folhaParaExcluir: FolhaPagamento | null = null;
  processando = false;
  erroOperacao = '';
  carregandoLista = true;

  ngOnInit(): void {
    this.subscriptions.add(
      this.folhaService.obterTodas().subscribe({
        next: (folhas) => {
          this.carregandoLista = false;
          this.folhas = folhas;
          this.aplicarFiltro();
        },
        error: (erro: unknown) => {
          this.carregandoLista = false;
          this.definirErro(erro);
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  aplicarFiltro(): void {
    if (this.filtroStatus === 'todas') {
      this.folhasFiltradas = [...this.folhas];
    } else {
      this.folhasFiltradas = this.folhas.filter(
        (f) => f.status === this.filtroStatus
      );
    }
    // Ordenar por data de atualização (mais recente primeiro)
    this.folhasFiltradas.sort(
      (a, b) => b.atualizadaEm.getTime() - a.atualizadaEm.getTime()
    );
  }

  abrirFormNova(): void {
    this.folhaEditando = null;
    this.mostrarFormFolha = true;
  }

  abrirFormEditar(folha: FolhaPagamento): void {
    this.folhaEditando = folha;
    this.mostrarFormFolha = true;
  }

  fecharForm(): void {
    this.mostrarFormFolha = false;
    this.folhaEditando = null;
  }

  salvarFolha(nomeFuncionario: string): void {
    if (this.processando) return;

    const operacao = this.folhaEditando
      ? this.folhaService.atualizar(this.folhaEditando.id, nomeFuncionario)
      : this.folhaService.criar(nomeFuncionario).pipe(map(() => true));

    this.executarOperacao(operacao, (resultado) => {
      if (resultado === false) {
        this.erroOperacao = 'Não foi possível atualizar a folha.';
        return;
      }
      this.fecharForm();
    });
  }

  abrirDetalhes(folha: FolhaPagamento): void {
    this.folhaSelecionada = folha;
  }

  fecharDetalhes(): void {
    this.folhaSelecionada = null;
  }

  atualizarFolhaSelecionada(): void {
    if (!this.folhaSelecionada) return;

    this.subscriptions.add(
      this.folhaService.obterPorId(this.folhaSelecionada.id)
        .pipe(take(1))
        .subscribe({
          next: (folhaAtualizada) => {
            this.folhaSelecionada = folhaAtualizada ?? null;
          },
          error: (erro: unknown) => this.definirErro(erro),
        })
    );
  }

  confirmarExclusao(folha: FolhaPagamento): void {
    this.folhaParaExcluir = folha;
  }

  excluirFolha(): void {
    if (!this.folhaParaExcluir || this.processando) return;

    this.executarOperacao(
      this.folhaService.remover(this.folhaParaExcluir.id),
      (removida) => {
        if (!removida) {
          this.erroOperacao = 'A folha não foi encontrada para exclusão.';
          return;
        }
        this.folhaParaExcluir = null;
      }
    );
  }

  calcularTotalEntradas(folha: FolhaPagamento): number {
    return this.folhaService.calcularTotalEntradas(folha);
  }

  calcularTotalDescontos(folha: FolhaPagamento): number {
    return this.folhaService.calcularTotalDescontos(folha);
  }

  calcularTotalLiquido(folha: FolhaPagamento): number {
    return this.folhaService.calcularTotalLiquido(folha);
  }

  private executarOperacao<T>(
    operacao: Observable<T>,
    aoConcluir: (resultado: T) => void
  ): void {
    this.processando = true;
    this.erroOperacao = '';
    this.subscriptions.add(
      operacao.pipe(
        take(1),
        finalize(() => this.processando = false)
      ).subscribe({
        next: aoConcluir,
        error: (erro: unknown) => this.definirErro(erro),
      })
    );
  }

  private definirErro(erro: unknown): void {
    this.erroOperacao =
      erro instanceof Error ? erro.message : 'Não foi possível concluir a operação.';
  }
}
