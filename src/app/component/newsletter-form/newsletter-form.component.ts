import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EmpreendimentoDto } from '../../dto/empreendimento.dto';
import { EmpreendimentoService } from '../../services/empreendimento.service';
import { NgOptimizedImage } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { NewsletterService } from '../../services/newsletter.service';

@Component({
  selector: 'newsletter-form',
  standalone: true,
  imports: [RouterLink, 
    HeaderComponent, 
    FooterComponent, 
    NgOptimizedImage, 
    NewsletterFormComponent, 
    DialogModule, 
    ButtonModule, 
    InputTextModule,
    ReactiveFormsModule],
  providers: [NewsletterService, EmpreendimentoService],
  templateUrl: './newsletter-form.component.html',
  styleUrl: './newsletter-form.component.css'
})
export class NewsletterFormComponent {
  @Input() visibleCreate: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  
  form!: FormGroup;
  loading = signal(false);

  constructor (
    private empreendimentoService: EmpreendimentoService,
    private fb: FormBuilder,
    private router: Router
  ){
    this.form = this.fb.group({
      nome_fantasia: [''],
      razao_social: ['', Validators.required],
      documento: ['', Validators.required],
      ramo_atividade: ['', Validators.required],
      nome_proprietario: ['', Validators.required],
      responsavel_tecnico: [''],
      telefone: ['', Validators.required],
      logradouro: [''],
      bairro: ['', Validators.required]
    });
  }

  save() {    
    if (this.form.valid) {
      const createRequest: EmpreendimentoDto = this.form.value;

      createRequest.documento = this.maskDoc(createRequest.documento);
      createRequest.telefone = this.maskPhone(createRequest.telefone);
      
      this.empreendimentoService.createAsync(createRequest).subscribe({
        next: (result) => {          
          this.form.reset();
          alert(result.message);
          this.router.navigate(['/home'], { queryParams: { reload: 'true' } });
          this.visibleCreate = false;
      }});
    } else {
      alert('Formulário inválido. Preencha todos os dados.');
    }       
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
    return value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
}
