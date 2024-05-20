import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'table',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {

}
