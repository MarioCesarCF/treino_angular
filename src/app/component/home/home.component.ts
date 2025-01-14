import { CommonModule } from '@angular/common';
import { FetchBackend, HttpBackend, HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { EmpreendimentoDto } from '../../dto/empreendimento.dto';
import { DadosEmpresa } from '../../intefaces/dadosEmpresa.interface';
import { Empreendimento } from '../../intefaces/empreendimento.interface';
import { SearchDTO } from '../../intefaces/searchDTO';
import { EmpreendimentoService } from '../../services/empreendimento.service';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

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
    EmpreendimentoService
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
    CalendarModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  form: FormGroup;
  filtroForm: FormGroup;
  licencaForm: FormGroup;

  visibleUpdate: boolean = false;
  visibleCreate: boolean = false;
  dialogAberto: boolean = false;
  dialogImprimirLicenca: boolean = false;
  selectedEmpreendimentoId: string = "";

  nome_fantasia?: string;
  bairro?: string;
  ramo_atividade?: string;
  situacao: boolean = true;

  empreendimentos!: Empreendimento[];
  empreendimento!: Empreendimento;

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
    private cd: ChangeDetectorRef,
    private http: HttpClient
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
    })
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

    const params: SearchDTO = {
      nome_fantasia: nome,
      bairro: bairro,
      ramo_atividade: atividade,
      situacao: situacao
    }

    this.empreendimentoService.getAll(params).subscribe({
      next: (result) => {
        this.empreendimentos = result.data.sort(function(a,b) {
          return a.nome_fantasia < b.nome_fantasia ? -1 : a.nome_fantasia > b.nome_fantasia ? 1 : 0;
        });
        this.cd.detectChanges();
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

  showDialogCadastro() {
    this.visibleCreate = true;
    this.dialogAberto = true;
  }

  showDialogImprimirLicenca() {
    this.dialogImprimirLicenca = true;
  }

  closeDialog() {
    this.visibleUpdate = false;
    this.selectedEmpreendimentoId = "";
    this.visibleCreate = false;
    this.dialogAberto = false;
    this.dialogImprimirLicenca = false;
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
            alert(result.message);
            this.visibleUpdate = false;
            this.closeDialog();
            window.location.reload();
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
            alert(result.message);
            this.visibleCreate = false;
            this.closeDialog();
            window.location.reload();
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
      alert("Preencha todos os dados do formulário!");
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
    doc.addImage(img, 'PNG', 25, 10, 25, 25);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const headerText = 'PREFEITURA MUNICIPAL DE ECOPORANGA';
    const headerText2 = 'SECRETARIA MUNICIPAL DE SAÚDE';
    const headerText3 = 'VIGILÂNCIA SANITÁRIA';

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
    const title = 'LICENÇA SANITÁRIA';
    let titleWidth = doc.getTextWidth(title);
    let xPosition = (doc.internal.pageSize.getWidth() - titleWidth) / 2;
    doc.text(title, xPosition, 45);

    const numeroLicenca = `Nº: ${numero}`;
    titleWidth = doc.getTextWidth(numeroLicenca);
    xPosition = (doc.internal.pageSize.getWidth() - titleWidth) / 2;
    doc.text(numeroLicenca, xPosition, 55);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Número do Processo: ${processo}`, 20, 65);
    doc.text(`Data do Processo: ${data}`, 120, 65);
    doc.text(`Vigência da Licença: ${vigencia}`, 20, 70);
    doc.text(`Tipo: ${tipo.label}`, 120, 70);

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
    doc.text(`Responsável Técnico: ${formData.responsavel_tecnico}`, 20, 120, { maxWidth: 160 });

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

        yPosition += 8;
      }
    });

    doc.setFontSize(8);
    doc.text(`É de responsabilidade dos proprietários/responsáveis legais: conhecer a legislação sanitária vigente e cumpri-la integralmente, inclusive futuras atualizações; observar as boas práticas referentes às atividades/serviços prestados; garantir a veracidade das informações aqui apresentadas; e atender as obrigações e exigências legais para o exercício das atividades/serviços. Conforme Lei Municipal nº 1.459/2010.`, 20, 245, { maxWidth: 160, align: "justify" });
    doc.text(`Ecoporanga-ES, ${this.dataHoje}`, 20, 260);

    doc.setFontSize(12);
    const autoridadeSanitaria = 'Autoridade Sanitária';
    titleWidth = doc.getTextWidth(autoridadeSanitaria);
    xPosition = (doc.internal.pageSize.getWidth() - titleWidth) / 2;
    doc.text(autoridadeSanitaria, xPosition, 280);
    const vigilanciaSanitaria = 'VIGILÂNCIA SANITÁRIA DE ECOPORANGA';
    titleWidth = doc.getTextWidth(vigilanciaSanitaria);
    xPosition = (doc.internal.pageSize.getWidth() - titleWidth) / 2;
    doc.text(vigilanciaSanitaria, xPosition, 285);

    doc.setFontSize(8);
    const footerText = 'Av. Floriano Rubim, s/n, Centro, Ecoporanga/ES. Fone: (27) 99629-4357. E-mail: visaecoporanga@gmail.com';
    const footerWidth = doc.getTextWidth(footerText);
    const xFooterPosition = (doc.internal.pageSize.getWidth() - footerWidth) / 2;
    doc.text(footerText, xFooterPosition, doc.internal.pageSize.getHeight() - 5);

    //Faz o download direto com o nome
    doc.save(`licenca_sanitaria_${numero}_${formData.ramo_atividade}_${formData.nome_fantasia}.pdf`);

    //Abre o PDF em uma nova aba para ser feito o download
    // const pdfBlob = doc.output("blob");
    // const pdfURL = URL.createObjectURL(pdfBlob);
    // window.open(pdfURL, "_blank");
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
      situacao: situacao
    }

    if (this.todosEmpreendimentos.length === 0) {
      this.empreendimentoService.getAll(params).subscribe({
        next: (result) => {
          this.todosEmpreendimentos = result.data.sort(function(a,b) {
            return a.nome_fantasia < b.nome_fantasia ? -1 : a.nome_fantasia > b.nome_fantasia ? 1 : 0;
          });
          this.filtrarLocalmente(query);
        }
      });
    } else {
      this.filtrarLocalmente(query);
    }
  }

  private filtrarLocalmente(query: string) {
    this.empreendimentosFiltrados = this.todosEmpreendimentos.filter(empreendimento =>
      empreendimento.nome_fantasia.toLowerCase().includes(query)
    );
  }
}
