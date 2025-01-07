import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FetchBackend, HttpBackend } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { jsPDF } from 'jspdf';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { EmpreendimentoDto } from '../../dto/empreendimento.dto';
import { Empreendimento } from '../../intefaces/empreendimento.interface';
import { EmpreendimentoService } from '../../services/empreendimento.service';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { NewsletterFormComponent } from '../newsletter-form/newsletter-form.component';
import { UpdateFormComponent } from '../update-form/update-form.component';
import { HttpClient } from '@angular/common/http';

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
  dialogAberto: boolean = false;
  selectedEmpreendimentoId: string = "";

  nome_fantasia?: string;
  bairro?: string;
  ramo_atividade?: string;
  situacao: boolean = true;

  empreendimentos!: Empreendimento[];
  empreendimento!: Empreendimento;

  cols!: Column[];
  filtroForm: FormGroup;  
  exportColumns!: ExportColumn[];

  apiUrl: string = "https://publica.cnpj.ws/cnpj";

  constructor(
    private empreendimentoService: EmpreendimentoService,
    private fb: FormBuilder,
    private router: Router,
    private cd: ChangeDetectorRef,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      nome_fantasia: ['', Validators.required],
      razao_social: ['', Validators.required],
      documento: ['', Validators.required],
      ramo_atividade: ['', Validators.required],
      nome_proprietario: ['', Validators.required],
      responsavel_tecnico: [''],
      telefone: ['', Validators.required],
      logradouro: ['', Validators.required],
      bairro: ['', Validators.required],
      numero: [''],
      situacao: [this.situacao]
    });

    this.filtroForm = this.fb.group({
      nome: [''],
      bairro: [''],
      atividade: [''],
      situacao: [this.situacao]
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

  carregarDados(empreendimentoId: string): void {
    this.empreendimentoService.getById(empreendimentoId).subscribe({
      next: (result) => {
        this.empreendimento = result;
        this.form.patchValue(this.empreendimento);
      },
      error: (err) => {
        alert('Erro ao obter dados do empreendimento: ' + err);
      }
    });
  }

  obterTodos() {
    this.visibleUpdate = false;
    this.selectedEmpreendimentoId = "";
    this.visibleCreate = false;

    let { nome, bairro, atividade, situacao } = this.filtroForm.value;

    if (this.situacao === false) {
      situacao = false;      
    } else {
      situacao = true;
    }

    this.empreendimentoService.obterTodos(nome, bairro, atividade, situacao).subscribe({
      next: (result) => {
        this.empreendimentos = result.data;
        this.cd.detectChanges();
      },
      error: (err) => {
        alert('Erro ao obter empreendimentos: ' + err.error.message);
      }
    });
  }

  limparFiltro() {
    this.filtroForm = this.fb.group({
      nome: [''],
      bairro: [''],
      atividade: [''],
      situacao: [this.situacao]
    });
  }

  obterInativos() {
    this.situacao = !this.situacao;
    this.obterTodos();
  }

  obterAtivos() {
    this.situacao = !this.situacao;    
    this.obterTodos();
  }

  tornarInativo(empreendimento: Empreendimento) {
    if (empreendimento.situacao) {
      empreendimento.situacao = false;
    }

    this.empreendimentoService.updateAsync(empreendimento).subscribe({
      next: (result) => {
        alert(`Empreendimento ${empreendimento.nome_fantasia} inativado com sucesso.`);
        this.obterTodos();
      }
    });
  }

  showDialogUpdate(empreendimentoId: string) {
    this.selectedEmpreendimentoId = empreendimentoId;
    this.visibleUpdate = true;
    this.dialogAberto = true;
    this.carregarDados(this.selectedEmpreendimentoId);
  }

  showDialog() {
    this.visibleCreate = true;
    this.dialogAberto = true;
  }

  closeDialog() {
    this.visibleUpdate = false;
    this.selectedEmpreendimentoId = "";
    this.visibleCreate = false;
    this.dialogAberto = false;
    this.obterTodos();
    this.form.reset();
  }

  save(): void {
    if (this.form.valid) {
      if (this.selectedEmpreendimentoId) {
        const updateRequest: EmpreendimentoDto = { ...this.form.value, id: this.selectedEmpreendimentoId };

        updateRequest.documento = this.maskDoc(updateRequest.documento);
        updateRequest.telefone = this.maskPhone(updateRequest.telefone);

        this.empreendimentoService.updateAsync(updateRequest).subscribe({
          next: (result) => {
            alert(result.message);
            this.visibleUpdate = false;
            this.closeDialog();
          }
        });
      } else {
        const createRequest: EmpreendimentoDto = this.form.value;

        createRequest.documento = this.maskDoc(createRequest.documento);
        createRequest.telefone = this.maskPhone(createRequest.telefone);

        this.empreendimentoService.createAsync(createRequest).subscribe({
          next: (result) => {
            this.form.reset();
            alert(result.message);
            this.visibleCreate = false;
            this.closeDialog();
          }
        });
      }
    } else {
      alert('Formulário inválido. Preencha todos os dados corretamente.');
    }
  }

  generatePDF(): void {
    const data_atualizacao = this.formatDate(this.empreendimento.updatedAt);

    const doc = new jsPDF();

    const img = new Image();
    img.src = './assets/brasao-eco.png';
    doc.addImage(img, 'PNG', 25, 10, 25, 25);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const headerText = 'PREFEITURA MUNICIPAL DE ECOPORANGA';
    const headerText2 = 'ESTADO DO ESPÍRITO SANTO';
    const headerText3 = 'SECRETARIA MUNICIPAL DE SAÚDE';

    const headerWidth = doc.getTextWidth(headerText);
    const xHeaderPosition = (doc.internal.pageSize.getWidth() - headerWidth) / 2;
    doc.text(headerText, xHeaderPosition, 20);

    const headerWidth2 = doc.getTextWidth(headerText2);
    const xHeaderPosition2 = (doc.internal.pageSize.getWidth() - headerWidth2) / 2;
    doc.text(headerText2, xHeaderPosition2, 25);

    const headerWidth3 = doc.getTextWidth(headerText3);
    const xHeaderPosition3 = (doc.internal.pageSize.getWidth() - headerWidth3) / 2;
    doc.text(headerText3, xHeaderPosition3, 30);

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const title = 'Dados do Empreendimento';
    const titleWidth = doc.getTextWidth(title);
    const xPosition = (doc.internal.pageSize.getWidth() - titleWidth) / 2;
    doc.text(title, xPosition, 60);

    doc.setFontSize(12);
    doc.text('', 20, 60);

    const formData = this.form.value;
    let yPosition = 90;

    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        const formattedKey = key.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase());
        const value = formData[key];

        doc.setFont('helvetica', 'bold');
        doc.text(`${formattedKey}:`, 20, yPosition);

        doc.setFont('helvetica', 'normal');
        let maskedValue = this.applyMask(key, value);

        if (key === 'situacao') {
          maskedValue = value ? 'Ativo' : 'Inativo';
        }

        doc.text(maskedValue, 80, yPosition);

        yPosition += 10;
      }
    }

    doc.setFontSize(8);
    doc.text(`Última atualização do empreendimento: ${data_atualizacao}`, 20, 190);
    doc.setFontSize(12);
    doc.text('Autoridade Sanitária', 80, 240);
    doc.text('VIGILÂNCIA SANITÁRIA DE ECOPORANGA', 55, 250);

    doc.setFontSize(8);
    const footerText = 'Av. Floriano Rubim, s/n, Centro, Ecoporanga/ES. Fone: (27) 99629-4357. E-mail: visaecoporanga@gmail.com';
    const footerWidth = doc.getTextWidth(footerText);
    const xFooterPosition = (doc.internal.pageSize.getWidth() - footerWidth) / 2;
    doc.text(footerText, xFooterPosition, doc.internal.pageSize.getHeight() - 10);

    doc.save(`${formData.nome_fantasia}.pdf`);
  }

  licencaPDF(): void {
    let num = this.getNumberCnpj(this.form.value.documento);

    let empresa = this.getCNPJ(num);

    console.log(empresa)
    // const doc = new jsPDF();

    // const img = new Image();
    // img.src = './assets/brasao-eco.png';
    // doc.addImage(img, 'PNG', 25, 10, 25, 25);

    // doc.setFontSize(12);
    // doc.setFont('helvetica', 'bold');
    // const headerText = 'PREFEITURA MUNICIPAL DE ECOPORANGA';
    // const headerText2 = 'SECRETARIA MUNICIPAL DE SAÚDE';
    // const headerText3 = 'VIGILÂNCIA SANITÁRIA';

    // const headerWidth = doc.getTextWidth(headerText);
    // const xHeaderPosition = (doc.internal.pageSize.getWidth() - headerWidth) / 2;
    // doc.text(headerText, xHeaderPosition, 20);

    // const headerWidth2 = doc.getTextWidth(headerText2);
    // const xHeaderPosition2 = (doc.internal.pageSize.getWidth() - headerWidth2) / 2;
    // doc.text(headerText2, xHeaderPosition2, 25);

    // const headerWidth3 = doc.getTextWidth(headerText3);
    // const xHeaderPosition3 = (doc.internal.pageSize.getWidth() - headerWidth3) / 2;
    // doc.text(headerText3, xHeaderPosition3, 30);

    // doc.setFontSize(20);
    // const title = 'LICENÇA SANITÁRIA';
    // const titleWidth = doc.getTextWidth(title);
    // const xPosition = (doc.internal.pageSize.getWidth() - titleWidth) / 2;
    // doc.text(title, xPosition, 60);

    // doc.setFontSize(12);
    // doc.text('', 20, 60);

    // const formData = this.form.value;
    // let yPosition = 90;

    // this.getNumberCnpj(this.form.value.documento);
    
    // for (const key in formData) {
    //   if (formData.hasOwnProperty(key)) {
    //     const formattedKey = key.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase());
    //     const value = formData[key];

    //     doc.setFont('helvetica', 'bold');
    //     doc.text(`${formattedKey}:`, 20, yPosition);

    //     doc.setFont('helvetica', 'normal');
    //     let maskedValue = this.applyMask(key, value);

    //     if (key === 'situacao') {
    //       maskedValue = value ? 'Ativo' : 'Inativo';
    //     }

    //     doc.text(maskedValue, 80, yPosition);

    //     yPosition += 10;
    //   }
    // }

    // doc.setFontSize(12);
    // doc.text('Autoridade Sanitária', 80, 240);
    // doc.text('VIGILÂNCIA SANITÁRIA DE ECOPORANGA', 55, 250);

    // doc.setFontSize(8);
    // const footerText = 'Av. Floriano Rubim, s/n, Centro, Ecoporanga/ES. Fone: (27) 99629-4357. E-mail: visaecoporanga@gmail.com';
    // const footerWidth = doc.getTextWidth(footerText);
    // const xFooterPosition = (doc.internal.pageSize.getWidth() - footerWidth) / 2;
    // doc.text(footerText, xFooterPosition, doc.internal.pageSize.getHeight() - 10);

    // doc.save(`${formData.nome_fantasia}.pdf`);
  }

  private applyMask(key: string, value: any): string {
    const stringValue = value ? String(value) : '';

    if (key === 'documento') {
      return this.maskDoc(stringValue);
    } else if (key === 'telefone') {
      return this.maskPhone(stringValue);
    }
    return stringValue;
  }

  private maskDoc(value: string): string {
    if (value.length == 14) {
      return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    } else if (value.length == 11) {
      return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return value;
    }
  }

  private maskPhone(value: string): string {
    if (value.length == 10) {
      return value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (value.length == 11) {
      return value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else {
      return value;
    }    
  }

  formatDate(dateString: Date): string {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês é zero-indexado
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  formatarDocumento(documento: number): string {
    const docStr: string = documento.toString();

    return docStr.length === 14 ?
      docStr.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') :
      docStr.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatarTelefone(telefone: number): string {
    const tel: string = telefone.toString();

    return tel.length === 11 ?
      tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') :
      tel.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  tornarAtivo(empreendimento: EmpreendimentoDto) {
    const updateRequest: EmpreendimentoDto = { ...empreendimento };
    updateRequest.situacao = true;

    this.empreendimentoService.updateAsync(updateRequest).subscribe({
      next: (result) => {
        alert(`Situação do empreendimento ${empreendimento.nome_fantasia} atualizada para ativo.`);
        this.obterTodos();
      }
    });
  }

  deletar(empreendimento: Empreendimento) {
    this.empreendimentoService.deleteAsync(empreendimento.id).subscribe({
      next: (result) => {
        alert(`Empreendimento ${empreendimento.nome_fantasia} deletado com sucesso.`);
        this.obterTodos();
      }
    });
  }

  getNumberCnpj(cnpj: string): number {
    const cnpjNumerico = cnpj.replace(/[^\d]/g, '');
    const cnpjNumber = Number(cnpjNumerico);

    if (isNaN(cnpjNumber)) {
      throw new Error('CNPJ inválido');
    }

    return cnpjNumber;
  }

  async getCNPJ(cnpj: number): Promise<any> {  
    try {
      const empresa = await this.http.get<any>(`${this.apiUrl}/${cnpj}`).toPromise();
      console.log(empresa);
      //Ideia, criar uma interface da empresa com os dados que vou precisar. CNAEs
      return empresa;
    } catch (e) {
      console.log(e);
    }
  }
}
