import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FetchBackend, HttpBackend } from '@angular/common/http';
import { EmpreendimentoService } from '../../services/empreendimento.service';
import { Empreendimento } from '../../intefaces/empreendimento.interface';
import { CommonModule } from '@angular/common';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  providers: [{
    provide: HttpBackend,
    useClass: FetchBackend    
  }, EmpreendimentoService],
  imports: [HeaderComponent, FooterComponent, TableModule, CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit {  
  empreendimentos!: Empreendimento[];
  cols!: Column[];

  constructor(private empreendimentoService: EmpreendimentoService){}  

  ngOnInit() {    
    this.obterTodos();

    this.cols = [
      { field: 'razao_social', header: 'Razão Social' },
      { field: 'documento', header: 'Documento' },
      { field: 'ramo_atividade', header: 'Ramo Atividade' },
      { field: 'telefone', header: 'Telefone' }
    ];
  }

  obterTodos() {
    this.empreendimentoService.obterTodos().subscribe({
      next: (result) => {
        this.empreendimentos = result.results;
    }});
  }
}
