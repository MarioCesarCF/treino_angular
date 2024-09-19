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
import { ListComponent } from '../../features/list/list.component';
import { BtnPrimaryComponent } from '../btn-primary/btn-primary.component';
import { NewsletterFormComponent } from '../newsletter-form/newsletter-form.component';
import { TableComponent } from '../table/table.component';
import { EmpreendimentoDto } from '../../dto/empreendimento.dto';

@Component({
  selector: 'app-update-form',
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
  providers: [
    EmpreendimentoService
  ],
  templateUrl: './update-form.component.html',
  styleUrl: './update-form.component.css'
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

        this.form = this.fb.group({
          nome_fantasia: [this.empreendimento.nome_fantasia],
          razao_social: [this.empreendimento.razao_social],
          documento: [this.empreendimento.documento],
          ramo_atividade: [this.empreendimento.ramo_atividade],
          nome_proprietario: [this.empreendimento.nome_proprietario],
          telefone: [this.empreendimento.telefone],
          logradouro: [this.empreendimento.logradouro],
          bairro: [this.empreendimento.bairro]
        });
        
      },
      error: (err) => {
        console.error('Erro ao obter empreendimentos:', err);
      }
    });
  }

  save(): void {
    if (this.form.valid) {
      console.log(this.form.value)
      let updateRequest: Empreendimento = this.form.value;
      updateRequest.id = this.empreendimentoId;

      console.log(updateRequest)
      this.empreendimentoService.updateAsync(updateRequest).subscribe({
        next: (result) => {          
          this.form.reset();
          window.location.reload();
          alert(result.message);
      }});
    } else {
      alert('Formulário inválido. Preencha todos os dados.');
    }     
  }

  close() {
    this.onClose.emit();
    this.form.reset();
  }
}
