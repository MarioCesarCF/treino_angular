import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FetchBackend, HttpBackend } from '@angular/common/http';
import { EmpreendimentoService } from '../../services/empreendimento.service';
import { Empreendimento } from '../../intefaces/empreendimento.interface';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup } from '@angular/forms';

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
  imports: [HeaderComponent, FooterComponent, TableModule, CommonModule, ButtonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit {  
  empreendimentos!: Empreendimento[];
  cols!: Column[];
  filtroForm: FormGroup;

  constructor(private empreendimentoService: EmpreendimentoService,
    private fb: FormBuilder){
    this.filtroForm = this.fb.group({
      nome: [''],
      bairro: [''],
      atividade: [''],
      situacao: [true]
    });
  }  

  ngOnInit() {    
    this.obterTodos();

    this.cols = [
      { field: 'nome_fantasia', header: 'Nome Fantasia' },
      { field: 'documento', header: 'Documento' },
      { field: 'ramo_atividade', header: 'Ramo Atividade' },
      { field: 'telefone', header: 'Telefone' }
    ];
  }

  obterTodos() {
    // Obtém os valores do formulário
    const { nome, bairro, atividade, situacao } = this.filtroForm.value;

    // Chama o serviço com os filtros aplicados
    this.empreendimentoService.obterTodos(nome, bairro, atividade, situacao).subscribe({
      next: (result) => {
        this.empreendimentos = result.data;
      },
      error: (err) => {
        console.error('Erro ao obter empreendimentos:', err);
      }
    });
  }

  // Método para aplicar os filtros
  aplicarFiltros() {
    this.obterTodos();
  }

  delete(empreendimento: Empreendimento) {
    this.empreendimentoService.deleteAsync(empreendimento.id).subscribe({
      next: (result) => {
        alert('Empreendimento deletado.');
        window.location.reload();
      }
    });
  }

  atualizar(empreendimento: Empreendimento) {
    if(empreendimento.situacao) {
      empreendimento.situacao = false;
    }  else {
      empreendimento.situacao = true;
    }

    this.empreendimentoService.updateAsync(empreendimento).subscribe({
      next: (result) => {
        alert('Empreendimento atualizado com sucesso.');
        window.location.reload();
      }
    });
  }
}
