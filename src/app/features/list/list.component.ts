import { Component, inject } from '@angular/core';
import { MessagesService } from '../../services/messages.service';
import { Message } from '../../intefaces/message.interface';
import { HeaderComponent } from '../../component/header/header.component';
import { FooterComponent } from '../../component/footer/footer.component';
import { CardComponent } from '../card/card/card.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CardComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})

export class ListComponent {
  messagesList: Message[] = [];

  messagesService = inject(MessagesService);

  ngOnInit() {
    this.messagesService.getAll().subscribe((messages) => {
      this.messagesList = messages;
    })
  }
}
