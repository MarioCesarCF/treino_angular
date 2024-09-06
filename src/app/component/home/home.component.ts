import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { NgOptimizedImage } from '@angular/common';
import { BtnPrimaryComponent } from '../btn-primary/btn-primary.component';
import { NewsletterFormComponent } from '../newsletter-form/newsletter-form.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink } from '@angular/router';
import { ListComponent } from '../../features/list/list.component';
import { TableComponent } from '../table/table.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent, NgOptimizedImage, BtnPrimaryComponent, NewsletterFormComponent, ListComponent, TableComponent, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }
}
