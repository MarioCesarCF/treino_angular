import { Component, Output, signal } from '@angular/core';
import { BtnPrimaryComponent } from '../btn-primary/btn-primary.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NewsletterService } from '../../services/newsletter.service';
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
  providers: [NewsletterService],
  templateUrl: './newsletter-form.component.html',
  styleUrl: './newsletter-form.component.css'
})
export class NewsletterFormComponent {
  form!: FormGroup;
  loading = signal(false);
  @Output() visible: boolean = false;

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
    this.visible = false; 
    
    if (this.form.valid) {
      const createRequest: EmpreendimentoDto = this.form.value;
      console.log(createRequest )
      this.empreendimentoService.createAsync(createRequest).subscribe({
        next: (result) => {
          alert(result.message);
          this.form.reset();
          window.location.reload();
      }});
    } else {
      console.log('Formulário inválido');
    }       
  }
}
