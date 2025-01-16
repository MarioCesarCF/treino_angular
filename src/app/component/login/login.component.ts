import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { API_PATH, environment } from '../../environment/environment';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, InputTextModule, ButtonModule]
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router,
    private httpClient: HttpClient
  ) {}
  login(): void {
    const email = this.email;
    const password = this.password;

    this.httpClient.post(`${API_PATH}/auth`, { email, password }).subscribe((response: any) => {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userName', response.data.userName);
      localStorage.setItem('userId', response.data.userId);
      
      this.router.navigate(['/home']);
    });
  }
}
