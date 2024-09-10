import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { BtnPrimaryComponent } from '../btn-primary/btn-primary.component';
import { NewsletterFormComponent } from '../newsletter-form/newsletter-form.component';
import { FooterComponent } from '../footer/footer.component';
import { ListComponent } from '../../features/list/list.component';
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
    BtnPrimaryComponent, 
    NewsletterFormComponent, 
    ListComponent, 
    TableComponent, 
    DialogModule, 
    ButtonModule, 
    InputTextModule,
    ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  form: FormGroup;
  visible: boolean = false;

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
    this.visible = true;
  }

  save() {
    this.visible = false; 
    
    if (this.form.valid) {
      const createRequest: EmpreendimentoDto = this.form.value;
      console.log(createRequest )
      this.empreendimentoService.createAsync(createRequest).subscribe({
        next: (result) => {
          alert(result.message);
          window.location.reload();
      }});
    } else {
      console.log('Formulário inválido');
    }       
  }
}
