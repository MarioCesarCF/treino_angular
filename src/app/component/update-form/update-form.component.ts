import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from 'express';
import { EmpreendimentoService } from '../../services/empreendimento.service';
import { ButtonModule } from 'primeng/button';
import { Empreendimento } from '../../intefaces/empreendimento.interface';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-update-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, HeaderComponent, FooterComponent],
  templateUrl: './update-form.component.html',
  styleUrl: './update-form.component.css'
})
export class UpdateFormComponent implements OnInit{
  form: FormGroup;
  empreendimentoId: string = '';

  constructor(
    private empreendimentoService: EmpreendimentoService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router
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

  ngOnInit(): void {
    this.empreendimentoId = this.route.snapshot.paramMap.get('id')!;
    this.carregarDados();
  }

  carregarDados(): void {
    this.empreendimentoService.getById(this.empreendimentoId).subscribe({
      next: (result) => {
        this.form.patchValue(result);
      },
      error: (err) => {
        console.error('Erro ao obter empreendimentos:', err);
      }
    });
  }

  save(): void {
    console.log(this.form.value);
  }
}
