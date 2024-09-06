import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Empreendimento } from '../intefaces/empreendimento.interface';
import { API_PATH } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpreendimentoService {

  constructor(private httpClient: HttpClient) { }

  obterTodos(){
    return this.httpClient.get<Empreendimento[]>(`${API_PATH}/empreendimento`);
  }
}
