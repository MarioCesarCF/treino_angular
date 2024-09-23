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
import { Router } from '@angular/router';
import { UpdateFormComponent } from '../update-form/update-form.component';
import { DialogModule } from 'primeng/dialog';

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
  },
    EmpreendimentoService
  ],
  imports: [
    HeaderComponent, 
    FooterComponent, 
    TableModule, 
    CommonModule, 
    ButtonModule, 
    UpdateFormComponent, 
    DialogModule
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit {
  empreendimentos!: Empreendimento[];
  cols!: Column[];
  filtroForm: FormGroup;
  visible: boolean = false;
  selectedEmpreendimentoId: string | null = null;

  constructor(private empreendimentoService: EmpreendimentoService,
    private fb: FormBuilder,
    private router: Router
  ) {
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
    const { nome, bairro, atividade, situacao } = this.filtroForm.value;

    this.empreendimentoService.obterTodos(nome, bairro, atividade, situacao).subscribe({
      next: (result) => {
        this.empreendimentos = result.data;
      },
      error: (err) => {
        console.error('Erro ao obter empreendimentos:', err);
      }
    });
  }

  aplicarFiltros() {
    this.obterTodos();
  }

  tornarInativo(empreendimento: Empreendimento) {
    if (empreendimento.situacao) {
      empreendimento.situacao = false;
    }

    this.empreendimentoService.updateAsync(empreendimento).subscribe({
      next: (result) => {
        alert('Empreendimento inativado com sucesso.');
        window.location.reload();
      }
    });
  }

  consultar(empreendimento: Empreendimento) {
    this.router.navigate(['/update-form', empreendimento.id]);
  }

  showDialog(empreendimentoId: string) {
    this.selectedEmpreendimentoId = empreendimentoId;
    this.visible = true;
  }

  closeDialog() {
    this.visible = false;
    this.selectedEmpreendimentoId = null;
  }
}
