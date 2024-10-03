import { CommonModule } from '@angular/common';
import { HttpBackend, FetchBackend } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { Empreendimento } from '../../intefaces/empreendimento.interface';
import { EmpreendimentoService } from '../../services/empreendimento.service';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { UpdateFormComponent } from '../update-form/update-form.component';
import { InputTextModule } from 'primeng/inputtext';

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
  selector: 'app-inativos',
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
    ReactiveFormsModule,
    InputTextModule
  ],
  templateUrl: './inativos.component.html',
  styleUrl: './inativos.component.css'
})
export class InativosComponent implements OnInit {
  empreendimentos!: Empreendimento[];
  cols!: Column[];
  filtroForm: FormGroup;
  visibleUpdate: boolean = false;
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
      situacao: [false]
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

  delete(empreendimento: Empreendimento) {
    this.empreendimentoService.deleteAsync(empreendimento.id).subscribe({
      next: (result) => {
        alert('Empreendimento deletado.');
        this.obterTodos();
      }
    });
  }

  consultar(empreendimento: Empreendimento) {
    this.router.navigate(['/update-form', empreendimento.id]);
  }

  showDialog(empreendimentoId: string) {
    this.selectedEmpreendimentoId = empreendimentoId;
    this.visibleUpdate = true;
  }

  closeDialog() {
    this.visibleUpdate = false;
    this.selectedEmpreendimentoId = null;
    this.obterTodos();
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

  obterAtivos() {
    this.router.navigate(['/home']);
  }
}
