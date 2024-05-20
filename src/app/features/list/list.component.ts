import { Component, inject } from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {Observable, ReplaySubject} from 'rxjs';
import { MessagesService } from '../../services/messages.service';
import { Message } from '../../intefaces/message.interface';
import { HeaderComponent } from '../../component/header/header.component';
import { FooterComponent } from '../../component/footer/footer.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, MatCardModule, MatButtonModule, MatTableModule],
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

  displayedColumns: string[] = ['id', 'nome', 'email', 'mensagem'];
  dataSource = [...this.messagesList];
}
