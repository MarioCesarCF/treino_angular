import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-empreendimentos-table',
  standalone: true,
  templateUrl: './empreendimentos-table.component.html',
  styleUrls: ['./empreendimentos-table.component.css'],
  imports: [
    CommonModule, 
    TableModule, 
    ButtonModule
  ]
})
export class EmpreendimentosTableComponent {
  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Input() loading: boolean = false;
  @Input() situacao: boolean = true;

  @Output() view = new EventEmitter<string>();
  @Output() markInactive = new EventEmitter<any>();
  @Output() markActive = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

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
}
