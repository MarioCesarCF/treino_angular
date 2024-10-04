import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EmpreendimentoService } from '../../services/empreendimento.service';
import { ButtonModule } from 'primeng/button';
import { Empreendimento } from '../../intefaces/empreendimento.interface';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { NgOptimizedImage } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { NewsletterFormComponent } from '../newsletter-form/newsletter-form.component';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-update-form',
  standalone: true,
  imports: [RouterLink,
    HeaderComponent,
    FooterComponent,
    NgOptimizedImage,
    NewsletterFormComponent,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule
  ],
  providers: [
    EmpreendimentoService
  ],
  templateUrl: './update-form.component.html',
  styleUrls: ['./update-form.component.css']
})
export class UpdateFormComponent implements OnChanges {
  @Input() visibleUpdate: boolean = false;
  @Input() empreendimentoId: string | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Input() situacao!: boolean;

  form: FormGroup;
  empreendimento!: Empreendimento;

  constructor(
    private empreendimentoService: EmpreendimentoService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group({
      nome_fantasia: [''],
      razao_social: [''],
      documento: [''],
      ramo_atividade: [''],
      nome_proprietario: [''],
      responsavel_tecnico: [''],
      telefone: [''],
      logradouro: [''],
      bairro: [''],
      situacao: [this.situacao]
    });
  }

  ngOnChanges(): void {
    if (this.visibleUpdate && this.empreendimentoId) {
      this.carregarDados();
    }
  }

  carregarDados(): void {
    this.empreendimentoService.getById(this.empreendimentoId!).subscribe({
      next: (result) => {
        this.empreendimento = result;
        this.form.patchValue(this.empreendimento);
      },
      error: (err) => {
        console.error('Erro ao obter empreendimentos:', err);
      }
    });
  }  

  save(): void {
    if (this.form.valid) {
      let updateRequest: Empreendimento = { ...this.form.value, id: this.empreendimentoId };
      this.empreendimentoService.updateAsync(updateRequest).subscribe({
        next: (result) => {
          this.form.reset();
          alert(result.message);
          this.router.navigate(['/home'], { queryParams: { reload: 'true' } });
          this.visibleUpdate = false;
        }
      });
    } else {
      alert('Formulário inválido. Preencha todos os dados.');
    }
  }

  generatePDF(): void {
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
          maskedValue = value ? 'Ativo' : 'Inativo'; // Formata como "Ativo" ou "Inativo"
        }

        doc.text(maskedValue, 60, yPosition);

        yPosition += 10;
      }
    }

    doc.text('VIGILÂNCIA SANITÁRIA DE ECOPORANGA', 65, 250);

    doc.setFontSize(8);
    const footerText = 'Av. Floriano Rubim, s/n, Centro, Ecoporanga/ES. Fone: (27) 99629-4357. E-mail: visaecoporanga@gmail.com';
    const footerWidth = doc.getTextWidth(footerText);
    const xFooterPosition = (doc.internal.pageSize.getWidth() - footerWidth) / 2;
    doc.text(footerText, xFooterPosition, doc.internal.pageSize.getHeight() - 10);

    doc.save(`${formData.nome_fantasia}.pdf`);
  }

  private applyMask(key: string, value: any): string {
    const stringValue = value ? String(value) : '';

    if (key === 'documento') {
      return this.maskCNPJ(stringValue);
    } else if (key === 'telefone') {
      return this.maskPhone(stringValue);
    }
    return stringValue;
  }

  private maskCNPJ(value: string): string {
    if (value.length == 14) {
      return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    } else {
      return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
  }

  private maskPhone(value: string): string {
    return value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  close() {
    this.onClose.emit();
    this.form.reset();
  }
}

