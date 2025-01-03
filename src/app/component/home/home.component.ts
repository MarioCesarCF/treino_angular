import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { EmpreendimentoDto } from '../../dto/empreendimento.dto';
import { EmpreendimentoService } from '../../services/empreendimento.service';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { NewsletterFormComponent } from '../newsletter-form/newsletter-form.component';
import { HttpBackend, FetchBackend } from '@angular/common/http';
import { Empreendimento } from '../../intefaces/empreendimento.interface';
import { UpdateFormComponent } from '../update-form/update-form.component';
import { TableModule } from 'primeng/table';

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
  selector: 'app-home',
  standalone: true,
  providers: [{
    provide: HttpBackend,
    useClass: FetchBackend
  },
    EmpreendimentoService
  ],
  imports: [
    RouterLink,
    HeaderComponent,
    FooterComponent,
    NgOptimizedImage,
    NewsletterFormComponent,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    CommonModule,
    UpdateFormComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  form: FormGroup;

  visibleUpdate: boolean = false;
  visibleCreate: boolean = false;

  nome_fantasia?: string;
  bairro?: string;
  ramo_atividade?: string;
  situacao?: boolean;

  empreendimentos!: Empreendimento[];
  cols!: Column[];
  filtroForm: FormGroup;
  selectedEmpreendimentoId: string | null = null;
  verInativos: boolean = false;
  exportColumns!: ExportColumn[];

  constructor (
    private empreendimentoService: EmpreendimentoService,
    private fb: FormBuilder,
    private router: Router,
    private cd: ChangeDetectorRef
  ){
    this.form = this.fb.group({
      nome_fantasia: [''],
      razao_social: ['', Validators.required],
      documento: ['', Validators.required],
      ramo_atividade: ['', Validators.required],
      nome_proprietario: ['', Validators.required],
      telefone: ['', Validators.required],
      logradouro: [''],
      bairro: ['', Validators.required]
    });

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
    this.visibleUpdate = false;
    this.selectedEmpreendimentoId = null;
    this.visibleCreate = false;

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
        this.obterTodos();
      }
    });
  }

  consultar(empreendimento: Empreendimento) {
    this.router.navigate(['/update-form', empreendimento.id]);
  }

  showDialogUpdate(empreendimentoId: string) {
    this.selectedEmpreendimentoId = empreendimentoId;
    this.visibleUpdate = true;
  }

  // closeDialogUpdate() {
  //   this.visibleUpdate = false;
  //   this.selectedEmpreendimentoId = null;
  //   this.obterTodos();
  // }

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

  showDialog() {
    this.visibleCreate = true;
  }

  closeDialog() {
    this.visibleUpdate = false;
    this.selectedEmpreendimentoId = null;
    this.visibleCreate = false;
    this.obterTodos();
  }

  save() {
    if (this.form.valid) {
      const createRequest: EmpreendimentoDto = this.form.value;

      this.empreendimentoService.createAsync(createRequest).subscribe({
        next: (result) => {
          alert(result.message);
          this.form.reset();     
          this.visibleCreate = false;               
      }});
    } else {
      console.log('Formulário inválido');
    }
  }
}
