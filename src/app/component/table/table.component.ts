import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FetchBackend, HttpBackend } from '@angular/common/http';
import { EmpreendimentoService } from '../../services/empreendimento.service';
import { Empreendimento } from '../../intefaces/empreendimento.interface';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UpdateFormComponent } from '../update-form/update-form.component';
import { DialogModule } from 'primeng/dialog';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
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
    DialogModule,
    ReactiveFormsModule
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
  verInativos: boolean = false;
  exportColumns!: ExportColumn[];

  constructor(private empreendimentoService: EmpreendimentoService,
    private fb: FormBuilder,
    private router: Router,
    private cd: ChangeDetectorRef
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

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  obterTodos() {
    let { nome, bairro, atividade, situacao } = this.filtroForm.value;
    
    if(this.verInativos === true) {
      situacao = false;
    }

    this.empreendimentoService.obterTodos(nome, bairro, atividade, situacao).subscribe({
      next: (result) => {
        this.empreendimentos = result.data;
        this.cd.detectChanges();
        this.verInativos = false;
      },
      error: (err) => {
        console.error('Erro ao obter empreendimentos:', err);
      }
    });
  }

  obterInativos() {
    this.router.navigate(['/inativos']);
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

  formatarDocumento(documento: number): string {
    const docStr: string = documento.toString();

    return docStr.length === 14 ? 
    docStr.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : 
    docStr.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  formatarTelefone(telefone: number): string {
    const tel: string = telefone.toString();
      
    return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
}
