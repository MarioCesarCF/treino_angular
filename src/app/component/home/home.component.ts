import { CommonModule } from '@angular/common';
import { FetchBackend, HttpBackend, HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { EmpreendimentoDto } from '../../dto/empreendimento.dto';
import { SearchDTO } from '../../dto/searchDTO';
import { DadosEmpresa } from '../../intefaces/dadosEmpresa.interface';
import { Empreendimento } from '../../intefaces/empreendimento.interface';
import { EmpreendimentoService } from '../../services/empreendimento.service';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { EmpreendimentosTableComponent } from '../empreendimentos-table/empreendimentos-table.component';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

interface TiposLicenca {
  label: string
}

@Component({
  selector: 'app-home',
  standalone: true,
  providers: [{
    provide: HttpBackend,
    useClass: FetchBackend
  },
    EmpreendimentoService,
    MessageService
  ],
  imports: [
    HeaderComponent,
    FooterComponent,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    CommonModule,
    AutoCompleteModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    ToastModule,
    EmpreendimentosTableComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  form: FormGroup;
  filtroForm: FormGroup;
  licencaForm: FormGroup;
  requerimentoDamForm: FormGroup;

  visibleUpdate: boolean = false;
  visibleCreate: boolean = false;
  dialogAberto: boolean = false;
  dialogImprimirLicenca: boolean = false;
  dialogImprimirRequerimentoDam: boolean = false;
  selectedEmpreendimentoId: string = "";

  nome_fantasia?: string;
  bairro?: string;
  ramo_atividade?: string;
  situacao: boolean = true;

  empreendimentos: Empreendimento[] = [];
  empreendimento!: Empreendimento;
  loading: boolean = true;

  cols!: Column[];
  exportColumns!: ExportColumn[];

  apiUrl: string = "https://publica.cnpj.ws/cnpj";
  dadosEmpresa: DadosEmpresa = {};

  value!: string;
  tiposLicenca: TiposLicenca[] | undefined;
  tipoLicencaSelecionado: TiposLicenca | undefined;

  empreendimentoSelecionado: Empreendimento | null = null;
  empreendimentosFiltrados: Empreendimento[] = [];
  todosEmpreendimentos: Empreendimento[] = [];

  hoje: Date = new Date();
  dia = String(this.hoje.getDate()).padStart(2, '0');
  mes = String(this.hoje.getMonth() + 1).padStart(2, '0');
  ano = this.hoje.getFullYear();

  dataHoje = `${this.dia}/${this.mes}/${this.ano}`;

  constructor(
    private empreendimentoService: EmpreendimentoService,
    private fb: FormBuilder,
    private http: HttpClient,
    private messageService: MessageService
  ) {
    this.tiposLicenca = [
      {label: "Inicial"},
      {label: "Renovação"},
      {label: "Provisória"}
    ];

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

    this.licencaForm = this.fb.group({
      empreendimento: ['', Validators.required],
      numeroLicenca: ['', Validators.required],
      numeroProcesso: ['', Validators.required],
      dataProcesso: ['', Validators.required],
      vigenciaLicenca: ['', Validators.required],
      tipoLicenca: [this.tiposLicenca, Validators.required]
    });

    this.requerimentoDamForm = this.fb.group({
      empreendimento: ['', Validators.required],
      grupo: ['', Validators.required],
      metragem: ['', Validators.required],
      numeroProcesso: ['', Validators.required],
      tipoDam: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.empreendimentos = [];
    this.loading = true;
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
      }
    });
  }

  obterTodos() {
    this.visibleUpdate = false;
    this.selectedEmpreendimentoId = "";
    this.visibleCreate = false;
    this.loading = true;

    let { nome, bairro, atividade, situacao } = this.filtroForm.value;

    if (this.situacao === false) {
      situacao = false;
    } else {
      situacao = true;
    }

    const params: SearchDTO = {
      nome_fantasia: nome,
      bairro: bairro,
      ramo_atividade: atividade,
      situacao: situacao
    }

    this.empreendimentoService.getAll(params).subscribe({
      next: (result) => {
        this.empreendimentos = result.data.sort(function(a, b) {
          return a.nome_fantasia < b.nome_fantasia ? -1 : a.nome_fantasia > b.nome_fantasia ? 1 : 0;
        });
        this.loading = false;
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
        this.messageService.add({ severity: 'success', detail: `Empreendimento ${empreendimento.nome_fantasia} foi inativado.` });
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

  showDialogCadastro() {
    this.visibleCreate = true;
    this.dialogAberto = true;
  }

  showDialogImprimirLicenca() {
    this.dialogImprimirLicenca = true;
  }

  showDialogImprimirRequerimentoDam() {
    this.dialogImprimirRequerimentoDam = true;
  }

  closeDialog() {
    this.visibleUpdate = false;
    this.selectedEmpreendimentoId = "";
    this.visibleCreate = false;
    this.dialogAberto = false;
    this.dialogImprimirLicenca = false;
    this.dialogImprimirRequerimentoDam = false;
    this.obterTodos();
    this.form.reset();
    this.licencaForm.reset();
  }

  save(): void {
    if (this.form.valid) {
      if (this.selectedEmpreendimentoId) {
        const updateRequest: EmpreendimentoDto = { ...this.form.value, id: this.selectedEmpreendimentoId };

        updateRequest.documento = this.maskDoc(updateRequest.documento);
        updateRequest.telefone = this.maskPhone(updateRequest.telefone);
        updateRequest.ramo_atividade = this.maskNomes(updateRequest.ramo_atividade);

        this.empreendimentoService.updateAsync(updateRequest).subscribe({
          next: (result) => {
            this.messageService.add({ severity: 'success', detail: result.message });
            this.closeDialog();
          }
        });
      } else {
        const createRequest: EmpreendimentoDto = this.form.value;

        createRequest.documento = this.maskDoc(createRequest.documento);
        createRequest.telefone = this.maskPhone(createRequest.telefone);
        createRequest.ramo_atividade = this.maskNomes(createRequest.ramo_atividade);

        this.empreendimentoService.createAsync(createRequest).subscribe({
          next: (result) => {
            this.form.reset();
            this.messageService.add({ severity: 'success', detail: result.message });
            this.closeDialog();
          }
        });
      }
    } else {
      this.messageService.add({ severity: 'error', detail: 'Formulário inválido. Preencha todos os dados corretamente.' });
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
    const listaPropriedades = ["Nome Fantasia", "Razão Social", "Documento", "Ramo de Atividade", "Nome Proprietário", "Responsável Técnico", "Telefone", "Logradouro", "Bairro", "Número", "Situação"];
    let index = 0;

    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        const value = formData[key];

        doc.setFont('helvetica', 'bold');
        doc.text(`${listaPropriedades[index]}:`, 20, yPosition);

        doc.setFont('helvetica', 'normal');
        let maskedValue = this.applyMask(key, value);

        if (key === 'situacao') {
          maskedValue = value ? 'Ativo' : 'Inativo';
        }

        doc.text(maskedValue, 80, yPosition);

        yPosition += 10;
        index++;
      }
    }

    doc.setFontSize(8);
    doc.text(`Última atualização do empreendimento: ${data_atualizacao}`, 20, 200);
    doc.setFontSize(12);
    doc.text('Autoridade Sanitária', 80, 240);
    doc.text('VIGILÂNCIA SANITÁRIA DE ECOPORANGA', 55, 250);

    doc.setFontSize(8);
    const footerText = 'Av. Floriano Rubim, s/n, Centro, Ecoporanga/ES. Fone: (27) 99629-4357. E-mail: visaecoporanga@gmail.com';
    const footerWidth = doc.getTextWidth(footerText);
    const xFooterPosition = (doc.internal.pageSize.getWidth() - footerWidth) / 2;
    doc.text(footerText, xFooterPosition, doc.internal.pageSize.getHeight() - 10);

    doc.save(`cadastro_${formData.nome_fantasia}.pdf`);
  }

  async licencaPDF(): Promise<void> {
    if(!this.licencaForm.valid) {
      this.messageService.add({ severity: 'error', detail: 'Preencha todos os dados do formulário!' });
      return;
    }

    let num = this.getNumberCnpj(this.licencaForm.value.empreendimento.documento);

    await this.getCNPJ(num);

    const numero = this.licencaForm.value.numeroLicenca;
    const processo = this.licencaForm.value.numeroProcesso;
    const data = this.licencaForm.value.dataProcesso;
    const vigencia = this.licencaForm.value.vigenciaLicenca;
    const tipo = this.licencaForm.value.tipoLicenca;

    const doc = new jsPDF();

    const img = new Image();
    img.src = './assets/brasao-eco.png';
    doc.addImage(img, 'PNG', 25, 10, 20, 20);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const headerText = 'PREFEITURA MUNICIPAL DE ECOPORANGA';
    const headerText2 = 'SECRETARIA MUNICIPAL DE SAÚDE';
    const headerText3 = 'VIGILÂNCIA SANITÁRIA';

    const headerWidth = doc.getTextWidth(headerText);
    const xHeaderPosition = (doc.internal.pageSize.getWidth() - headerWidth) / 2;
    doc.text(headerText, xHeaderPosition, 15);

    const headerWidth2 = doc.getTextWidth(headerText2);
    const xHeaderPosition2 = (doc.internal.pageSize.getWidth() - headerWidth2) / 2;
    doc.text(headerText2, xHeaderPosition2, 20);

    const headerWidth3 = doc.getTextWidth(headerText3);
    const xHeaderPosition3 = (doc.internal.pageSize.getWidth() - headerWidth3) / 2;
    doc.text(headerText3, xHeaderPosition3, 25);

    doc.setFontSize(20);
    const title = 'LICENÇA SANITÁRIA';
    let titleWidth = doc.getTextWidth(title);
    let xPosition = (doc.internal.pageSize.getWidth() - titleWidth) / 2;
    doc.text(title, xPosition, 45);

    const numeroLicenca = `Nº: ${numero}`;
    titleWidth = doc.getTextWidth(numeroLicenca);
    xPosition = (doc.internal.pageSize.getWidth() - titleWidth) / 2;
    doc.text(numeroLicenca, xPosition, 55);

    doc.rect(15, 36, 180, 39);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Número do Processo: ${processo}`, 20, 65);
    doc.text(`Data do Processo: ${data}`, 120, 65);
    doc.text(`Vigência da Licença: ${vigencia}`, 20, 70);
    doc.text(`Tipo: ${tipo.label}`, 120, 70);

    doc.rect(15, 75, 180, 50);

    const formData = this.licencaForm.value.empreendimento;
    const atividadesEmpresa = this.dadosEmpresa;
    const atividades = atividadesEmpresa.atividades_secundarias;

    doc.text(`Razão Social: ${formData.razao_social}`, 20, 80);
    doc.text(`Nome Fantasia: ${formData.nome_fantasia}`, 20, 85);
    doc.text(`CNPJ / CPF: ${formData.documento}`, 20, 90);
    doc.text(`Ramo de Atividade: ${formData.ramo_atividade}`, 120, 90);
    doc.text(`Logradouro: ${formData.logradouro}`, 20, 95);
    doc.text(`Número: ${formData.numero ? formData.numero : ''}`, 120, 95);
    doc.text(`Bairro: ${formData.bairro}`, 20, 100);
    doc.text(`Cidade: Ecoporanga`, 120, 100);
    doc.text(`UF: Espírito Santo`, 20, 105);
    doc.text(`CEP: 29.850-000`, 120, 105);

    doc.text(`Proprietário: ${formData.nome_proprietario}`, 20, 115, { maxWidth: 160 });
    doc.text(`Responsável Técnico: ${formData.responsavel_tecnico ? formData.responsavel_tecnico : ''}`, 20, 120, { maxWidth: 160 });

    doc.rect(15, 125, 180, 95);

    doc.setFont('helvetica', 'bold');
    doc.text(`Atividade Econômica Principal`, 20, 130);
    doc.setFont('helvetica', 'normal');
    doc.text(`CNAE: `, 20, 135);
    doc.text(`Descrição: `, 40, 135);
    if(atividadesEmpresa.atividade_principal?.cnae && atividadesEmpresa.atividade_principal?.descricao) {
      doc.text(`${atividadesEmpresa.atividade_principal?.cnae}`, 20, 140);
      doc.text(`${atividadesEmpresa.atividade_principal?.descricao}`, 40, 140, { maxWidth: 150 });
    } else {
      doc.text(`Não informado`, 20, 140);
    }
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Atividades Econômicas Secundárias (máximo de 10)`, 20, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(`CNAE: `, 20, 155);
    doc.text(`Descrição:`, 40, 155);

    let yPosition = 160;
    let count = 0;
    atividades?.forEach((item: any) => {
      count++;
      if(count <= 10) {
        doc.text(`${item.cnae}`, 20, (yPosition));
        doc.text(`${item.descricao}`, 40, (yPosition), { maxWidth: 150 });

        yPosition += 5;
      }
    });

    doc.rect(15, 220, 180, 60);

    doc.setFontSize(10);
    doc.text(`É de responsabilidade dos proprietários/responsáveis legais: conhecer a legislação sanitária vigente e cumpri-la integralmente, inclusive futuras atualizações; observar as boas práticas referentes às atividades/serviços prestados; garantir a veracidade das informações aqui apresentadas; e atender as obrigações e exigências legais para o exercício das atividades/serviços. Conforme Lei Municipal nº 1.459/2010.`, 20, 225, { maxWidth: 160, align: "justify" });
    doc.text(`Ecoporanga-ES, ${this.dataHoje}`, 20, 250);

    doc.setFontSize(12);
    const autoridadeSanitaria = 'Ana Sofya Cavalcante Alves Foca Moreira';
    titleWidth = doc.getTextWidth(autoridadeSanitaria);
    xPosition = (doc.internal.pageSize.getWidth() - titleWidth) / 2;
    doc.text(autoridadeSanitaria, xPosition, 270);
    const vigilanciaSanitaria = 'Coordenadora da Vigilância Sanitária';
    titleWidth = doc.getTextWidth(vigilanciaSanitaria);
    xPosition = (doc.internal.pageSize.getWidth() - titleWidth) / 2;
    doc.text(vigilanciaSanitaria, xPosition, 275);

    doc.setFontSize(8);
    const footerText = 'Av. Floriano Rubim, s/n, Centro, Ecoporanga/ES. Fone: (27) 99629-4357. E-mail: visaecoporanga@gmail.com';
    const footerWidth = doc.getTextWidth(footerText);
    const xFooterPosition = (doc.internal.pageSize.getWidth() - footerWidth) / 2;
    doc.text(footerText, xFooterPosition, doc.internal.pageSize.getHeight() - 8);

    //Faz o download direto com o nome
    doc.save(`licenca_sanitaria_n_${numero}_${formData.nome_fantasia}.pdf`);

    //Abre o PDF em uma nova aba para ser feito o download
    // const pdfBlob = doc.output("blob");
    // const pdfURL = URL.createObjectURL(pdfBlob);
    // window.open(pdfURL, "_blank");
  }

  requerimentoDamPDF(): void {
    if(!this.requerimentoDamForm.valid) {
      this.messageService.add({ severity: 'error', detail: 'Preencha todos os dados do formulário!' });
      return;
    }

    const doc = new jsPDF();

    const grupo = this.requerimentoDamForm.value.grupo;
    const metragem = this.requerimentoDamForm.value.metragem;
    const numeroProcesso = this.requerimentoDamForm.value.numeroProcesso;
    const tipoDam = this.requerimentoDamForm.value.tipoDam;
    const formData = this.requerimentoDamForm.value.empreendimento;

    const img = new Image();
    img.src = './assets/brasao-eco.png';
    doc.addImage(img, 'PNG', 25, 10, 25, 25);

    doc.setFontSize(14);
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

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const title = 'REQUERIMENTO - DAM';
    const titleWidth = doc.getTextWidth(title);
    const xPosition = (doc.internal.pageSize.getWidth() - titleWidth) / 2;
    doc.text(title, xPosition, 60);    
    
    doc.setFontSize(14);
    doc.text(`EMPRESA:`, 20, 90);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Razão Social: `, 20, 110);
    doc.text(`Nome Fantasia: `, 20, 120);
    doc.text(`CNPJ/CPF: `, 20, 130);
    doc.text(`Ramo de Atividade: `, 120, 130);
    doc.text(`Logradouro: `, 20, 140);
    doc.text(`Número: `, 120, 140);
    doc.text(`Bairro: `, 20, 150);
    doc.text(`Cidade: `, 120, 150);
    doc.text(`Grupo Atividade: `, 20, 160);
    doc.text(`Metragem: `, 120,160);
    doc.text(`Número do Processo: `, 20, 170);
    doc.text(`Proprietário: `, 20, 180);
    doc.text(`Responsável Técnico: `, 20, 190);
    doc.text('Tipo de tributo: ', 20, 200);

    doc.setFont('helvetica', 'normal');
    doc.text(`${formData.razao_social}`, 49, 110);
    doc.text(`${formData.nome_fantasia}`, 53, 120);
    doc.text(`${formData.documento}`, 45, 130);
    doc.text(`${formData.ramo_atividade}`, 161, 130);
    doc.text(`${formData.logradouro}`, 47, 140);
    doc.text(`${formData.numero ? formData.numero : ''}`, 139, 140);
    doc.text(`${formData.bairro}`, 36, 150);
    doc.text('Ecoporanga', 138, 150);
    doc.text(`${grupo}`, 55, 160);
    doc.text(`${metragem} m²`, 142,160);
    doc.text(`${numeroProcesso}`, 65, 170);
    doc.text(`${formData.nome_proprietario}`, 48, 180, { maxWidth: 160 });
    doc.text(`${formData.responsavel_tecnico ? formData.responsavel_tecnico : ''}`, 66, 190, { maxWidth: 160 });
    doc.text(`${tipoDam}`, 53, 200);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const nomeCoordenadora = 'Ana Sofya Cavalcante Alves Foca Moreira';
    const tituloCoordenadora = 'Coordenadora da Vigilância Sanitária';
    const decreto = 'Decreto nº 9.983 de 13 de janeiro de 2025';

    const nomeWidth = doc.getTextWidth(nomeCoordenadora);
    const xNomePosition = (doc.internal.pageSize.getWidth() - nomeWidth) / 2;
    doc.text(nomeCoordenadora, xNomePosition, 250);

    doc.setFont('helvetica', 'normal');
    const coordenadoraWidth = doc.getTextWidth(tituloCoordenadora);
    const xCoordenadoraPosition = (doc.internal.pageSize.getWidth() - coordenadoraWidth) / 2;
    doc.text(tituloCoordenadora, xCoordenadoraPosition, 255);

    const decretoWidth = doc.getTextWidth(decreto);
    const xDecretoPosition = (doc.internal.pageSize.getWidth() - decretoWidth) / 2;
    doc.text(decreto, xDecretoPosition, 260);

    doc.setFontSize(8);
    const footerText = 'Av. Floriano Rubim, s/n, Centro, Ecoporanga/ES. Fone: (27) 99629-4357. E-mail: visaecoporanga@gmail.com';
    const footerWidth = doc.getTextWidth(footerText);
    const xFooterPosition = (doc.internal.pageSize.getWidth() - footerWidth) / 2;
    doc.text(footerText, xFooterPosition, doc.internal.pageSize.getHeight() - 10);

    doc.save(`requerimento_dam_${formData.nome_fantasia}.pdf`);
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

  private maskNomes(value: string): string {
    value = value.replace(/^\w/, (c) => c.toUpperCase());
    return value;
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
        this.messageService.add({ severity: 'success', detail: `Situação do empreendimento ${empreendimento.nome_fantasia} atualizada para ativo.` });
        this.obterTodos();
      }
    });
  }

  deletar(empreendimento: Empreendimento) {
    this.empreendimentoService.deleteAsync(empreendimento.id).subscribe({
      next: (result) => {
        this.messageService.add({ severity: 'success', detail: `Empreendimento ${empreendimento.nome_fantasia} deletado com sucesso.` });
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
      this.dadosEmpresa = {};

      const empresaBuscada = await this.http.get<any>(`${this.apiUrl}/${cnpj}`).toPromise();

      this.dadosEmpresa = {
        atividade_principal: {
          cnae: empresaBuscada.estabelecimento.atividade_principal.subclasse,
          descricao: empresaBuscada.estabelecimento.atividade_principal.descricao
        },
        atividades_secundarias: []
      };

      if(empresaBuscada.estabelecimento.atividades_secundarias.length > 0) {
        let atividades = empresaBuscada.estabelecimento.atividades_secundarias;

        atividades.forEach((item: any) => {
          this.dadosEmpresa.atividades_secundarias?.push({
            cnae: item.subclasse,
            descricao: item.descricao
          });
        });
      };

      return empresaBuscada;
    } catch (e) {
    }
  }

  filtraEmpreendimento(event: any) {
    const query = event.query.toLowerCase();
    const situacao = true;

    const params: SearchDTO = {
      nome_fantasia: query,
      situacao: situacao
    }

    this.empreendimentoService.getAll(params).subscribe({
      next: (result) => {

        this.empreendimentosFiltrados = result.data.sort(function(a,b) {
          return a.nome_fantasia < b.nome_fantasia ? -1 : a.nome_fantasia > b.nome_fantasia ? 1 : 0;
        });
      }
    });
  }
}
