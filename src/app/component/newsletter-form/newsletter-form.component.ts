import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { BtnPrimaryComponent } from '../btn-primary/btn-primary.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EmpreendimentoDto } from '../../dto/empreendimento.dto';
import { EmpreendimentoService } from '../../services/empreendimento.service';
import { NgOptimizedImage } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ListComponent } from '../../features/list/list.component';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { TableComponent } from '../table/table.component';
import { NewsletterService } from '../../services/newsletter.service';

@Component({
  selector: 'newsletter-form',
  standalone: true,
  imports: [RouterLink, 
    HeaderComponent, 
    FooterComponent, 
    NgOptimizedImage, 
    BtnPrimaryComponent, 
    NewsletterFormComponent, 
    ListComponent, 
    TableComponent, 
    DialogModule, 
    ButtonModule, 
    InputTextModule,
    ReactiveFormsModule],
  providers: [NewsletterService, EmpreendimentoService],
  templateUrl: './newsletter-form.component.html',
  styleUrl: './newsletter-form.component.css'
})
export class NewsletterFormComponent {
  @Input() visible: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  
  form!: FormGroup;
  loading = signal(false);

  constructor (
    private empreendimentoService: EmpreendimentoService,
    private fb: FormBuilder
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
  }

  save() {    
    if (this.form.valid) {
      const createRequest: EmpreendimentoDto = this.form.value;
      
      this.empreendimentoService.createAsync(createRequest).subscribe({
        next: (result) => {          
          this.form.reset();
          window.location.reload();
          alert(result.message);
      }});
    } else {
      alert('Formulário inválido. Preencha todos os dados.');
    }       
  }
}
