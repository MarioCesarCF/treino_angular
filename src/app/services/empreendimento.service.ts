import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Empreendimento } from '../intefaces/empreendimento.interface';
import { API_PATH } from '../environment/environment';
import { EmpreendimentoDto } from '../dto/empreendimento.dto';

@Injectable({
  providedIn: 'root'
})
export class EmpreendimentoService {

  constructor(private httpClient: HttpClient) { }

  obterTodos(){
    return this.httpClient.get<{data:Empreendimento[]}>(`${API_PATH}/empreendimento`);
  }

  createAsync(createRequest: EmpreendimentoDto) {
    return this.httpClient.post<{status: number, message: string}>(`${API_PATH}/empreendimento`, createRequest);
  }

  deleteAsync(id: string) {
    return this.httpClient.delete<{status: number, message: string}>(`${API_PATH}/empreendimento/${id}`);
  }
}
