import { Component, NgModule  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { NewsletterFormComponent } from '../newsletter-form/newsletter-form.component';
import { FooterComponent } from '../footer/footer.component';
import { TableComponent } from '../table/table.component';
import { EmpreendimentoService } from '../../services/empreendimento.service';
import { EmpreendimentoDto } from '../../dto/empreendimento.dto';

@Component({
  selector: 'app-home',
  standalone: true,
  providers: [EmpreendimentoService],
  imports: [
    RouterLink, 
    HeaderComponent, 
    FooterComponent, 
    NgOptimizedImage, 
    NewsletterFormComponent, 
    TableComponent, 
    DialogModule, 
    ButtonModule, 
    InputTextModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  form: FormGroup;  

  visible: boolean = false;

  nome_fantasia?: string;
  bairro?: string;
  ramo_atividade?: string;
  situacao?: boolean;

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

  showDialog() {
    this.visible = !this.visible;
  }

  save() {
    this.visible = false; 
    
    if (this.form.valid) {
      const createRequest: EmpreendimentoDto = this.form.value;
      
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
