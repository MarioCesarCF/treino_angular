import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EmpreendimentoService } from '../../services/empreendimento.service';
import { ButtonModule } from 'primeng/button';
import { Empreendimento } from '../../intefaces/empreendimento.interface';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { NgOptimizedImage } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { NewsletterFormComponent } from '../newsletter-form/newsletter-form.component';
import { TableComponent } from '../table/table.component';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-update-form',
  standalone: true,
  imports: [RouterLink,
    HeaderComponent,
    FooterComponent,
    NgOptimizedImage,
    NewsletterFormComponent,
    TableComponent,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule],
  providers: [
    EmpreendimentoService
  ],
  templateUrl: './update-form.component.html',
  styleUrls: ['./update-form.component.css'] // Corrigi de styleUrl para styleUrls
})
export class UpdateFormComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() empreendimentoId: string | null = null;
  @Output() onClose = new EventEmitter<void>();

  form: FormGroup;
  empreendimento!: Empreendimento;

  constructor(
    private empreendimentoService: EmpreendimentoService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      nome_fantasia: [''],
      razao_social: [''],
      documento: [''],
      ramo_atividade: [''],
      nome_proprietario: [''],
      telefone: [''],
      logradouro: [''],
      bairro: ['']
    });
  }

  ngOnChanges(): void {
    if (this.visible && this.empreendimentoId) {
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
          window.location.reload();
          alert(result.message);
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
    doc.addImage(img, 'PNG', 25, 10, 25, 25); // Ajuste a posição e o tamanho conforme necessário

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
    const xPosition = (doc.internal.pageSize.getWidth() - titleWidth) / 2; // Centraliza o título
    doc.text(title, xPosition, 60);

    // Espaçamento antes do conteúdo
    doc.setFontSize(12); // Resetando tamanho da fonte para o conteúdo
    doc.text('', 20, 60); // Duas linhas de espaço

    const formData = this.form.value;
    let yPosition = 70;

    for (const key in formData) {
        if (formData.hasOwnProperty(key)) {
            // Formatar chave em negrito e primeira letra maiúscula
            const formattedKey = key.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase());
            const value = formData[key];

            // Define fonte para a chave em negrito
            doc.setFont('helvetica', 'bold');
            doc.text(`${formattedKey}:`, 20, yPosition);

            // Define fonte para o valor
            doc.setFont('helvetica', 'normal');
            const maskedValue = this.applyMask(key, value);
            doc.text(maskedValue, 60, yPosition);

            doc.text('VIGILÂNCIA SANITÁRIA DE ECOPORANGA', 65, 250)

            // Avança a posição vertical
            yPosition += 10; // Espaço após cada linha
        }
    }

    // Rodapé
    doc.setFontSize(8);
    const footerText = 'Av. Floriano Rubim, s/n, Centro, Ecoporanga/ES. Fone: (27) 99629-4357. E-mail: visaecoporanga@gmail.com';
    const footerWidth = doc.getTextWidth(footerText);
    const xFooterPosition = (doc.internal.pageSize.getWidth() - footerWidth) / 2;
    doc.text(footerText, xFooterPosition, doc.internal.pageSize.getHeight() - 10); // Posição na parte inferior

    doc.save(`${formData.nome_fantasia}.pdf`);
}


  private applyMask(key: string, value: any): string {
    // Garante que value seja uma string
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

