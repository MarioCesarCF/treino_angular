import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Empreendimento } from '../intefaces/empreendimento.interface';
import { API_PATH } from '../environment/environment';
import { EmpreendimentoDto } from '../dto/empreendimento.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpreendimentoService {

  constructor(private httpClient: HttpClient) { }

  obterTodos(
    nome_fantasia?: string,
    bairro?: string,
    ramo_atividade?: string,
    situacao?: boolean
  ): Observable<{ data: Empreendimento[] }> {
    let params = new HttpParams();
    
    if (nome_fantasia) {
      params = params.set('nome_fantasia', nome_fantasia);
    }
    if (bairro) {
      params = params.set('bairro', bairro);
    }
    if (ramo_atividade) {
      params = params.set('ramo_atividade', ramo_atividade);
    }
    if (situacao !== undefined) {
      params = params.set('situacao', situacao.toString());
    }

    return this.httpClient.get<{ data: Empreendimento[] }>(`${API_PATH}/empreendimento`, { params });
  }

  getById(id: string) {
    return this.httpClient.get<Empreendimento>(`${API_PATH}/empreendimento/${id}`);
  }

  createAsync(createRequest: EmpreendimentoDto) {
    return this.httpClient.post<{status: number, message: string}>(`${API_PATH}/empreendimento`, createRequest);
  }

  deleteAsync(id: string) {
    return this.httpClient.delete<{status: number, message: string}>(`${API_PATH}/empreendimento/${id}`);
  }

  updateAsync(empreendimento: Empreendimento) {
    return this.httpClient.patch<{status: number, message: string}>(`${API_PATH}/empreendimento/${empreendimento.id}`, empreendimento);
  }
}
