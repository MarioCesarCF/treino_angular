import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EmpreendimentoDto } from '../dto/empreendimento.dto';
import { API_PATH } from '../environment/environment';
import { Empreendimento } from '../intefaces/empreendimento.interface';
import { SearchDTO } from '../intefaces/searchDTO';

@Injectable({
  providedIn: 'root'
})
export class EmpreendimentoService {

  private empreendimentosSubject = new BehaviorSubject<Empreendimento[]>([]);
  public empreendimentos$ = this.empreendimentosSubject.asObservable();

  constructor(private httpClient: HttpClient) { }

  getAll(searchDTO: SearchDTO): Observable<{ data: Empreendimento[] }> {
    let params = new HttpParams();

    if (searchDTO.nome_fantasia) {
      params = params.set('nome_fantasia', searchDTO.nome_fantasia);
    }
    if (searchDTO.bairro) {
      params = params.set('bairro', searchDTO.bairro);
    }
    if (searchDTO.ramo_atividade) {
      params = params.set('ramo_atividade', searchDTO.ramo_atividade);
    }
    if (searchDTO.situacao !== undefined) {
      params = params.set('situacao', searchDTO.situacao.toString());
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

  updateAsync(empreendimento: EmpreendimentoDto) {
    return this.httpClient.patch<{status: number, message: string}>(`${API_PATH}/empreendimento/${empreendimento.id}`, empreendimento);
  }
}
