import { Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Message } from '../../../intefaces/message.interface';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  message = input.required<Message>();

  messageNome = computed(() => this.message().nome);
  messageEmail = computed(() => this.message().email);
  messageMessagem = computed(() => this.message().mensagem);
}
