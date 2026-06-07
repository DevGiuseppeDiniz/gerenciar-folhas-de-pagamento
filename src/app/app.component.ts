import { Component } from '@angular/core';
import { FolhaListaComponent } from './components/folha-lista/folha-lista.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FolhaListaComponent],
  template: `
    <header class="header">
      <div class="container">
        <h1 class="header-title">Gestão de Folha de Pagamento</h1>
        <p class="header-subtitle">Gerencie as folhas de pagamento dos funcionários</p>
      </div>
    </header>
    <main class="main-content">
      <div class="container">
        <app-folha-lista />
      </div>
    </main>
  `,
  styles: [`
    .header {
      background: linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%);
      color: white;
      padding: 2rem 0;
      margin-bottom: 2rem;
    }

    .header-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .header-subtitle {
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .main-content {
      padding-bottom: 2rem;
    }
  `]
})
export class AppComponent {}
