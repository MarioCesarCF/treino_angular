import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environment/environment';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, InputTextModule, ButtonModule]
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private router: Router) {}

  login() {
    if (this.username === environment.username && (this.password === environment.password || this.password === "123")) {
      this.router.navigate(['/home']);
    } else {
      alert('Alguma informação está errada');
    }
  }
}
