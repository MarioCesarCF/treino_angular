import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Message } from '../intefaces/message.interface';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  httpClient = inject(HttpClient);

  getAll() {
    return this.httpClient.get<Message[]>('/api/messages');
  }
}
