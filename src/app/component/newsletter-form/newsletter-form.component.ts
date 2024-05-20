import { Component, signal } from '@angular/core';
import { BtnPrimaryComponent } from '../btn-primary/btn-primary.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NewsletterService } from '../../services/newsletter.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'newsletter-form',
  standalone: true,
  imports: [RouterLink, BtnPrimaryComponent, ReactiveFormsModule],
  providers: [NewsletterService],
  templateUrl: './newsletter-form.component.html',
  styleUrl: './newsletter-form.component.css'
})
export class NewsletterFormComponent {
  newsletterForm!: FormGroup;
  loading = signal(false);

  constructor(private service: NewsletterService) {
    this.newsletterForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      prof: new FormControl('', [Validators.required])
    });
  }

  onSubmit() {
    this.loading.set(true);
    if(this.newsletterForm.valid) {
      this.service.sendData(this.newsletterForm.value.name, this.newsletterForm.value.email).subscribe({
        next: () => {
          this.newsletterForm.reset();
          this.loading.set(false);
        }
      })
    }
  }
}
