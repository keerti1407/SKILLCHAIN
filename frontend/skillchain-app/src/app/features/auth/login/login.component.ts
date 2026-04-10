import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

export type LoginRole = 'institution' | 'student' | 'employer';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  selectedRole: LoginRole = 'student';
  errorMessage = '';
  loading = false;

  constructor(
    public auth: AuthService,
    public route: ActivatedRoute,
    public toast: ToastService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const r = params.get('role');
      if (r === 'institution' || r === 'student' || r === 'employer') {
        this.selectedRole = r;
      }
    });
  }

  selectRole(role: LoginRole): void {
    this.selectedRole = role;
  }

  welcomeMessage(): string {
    switch (this.selectedRole) {
      case 'institution':
        return 'Welcome, Educator. Issue tamper-proof credentials.';
      case 'student':
        return 'Welcome, Learner. Access your Skill Passport.';
      case 'employer':
        return 'Welcome, Recruiter. Verify credentials instantly.';
      default:
        return '';
    }
  }

  cardClass(): string {
    switch (this.selectedRole) {
      case 'institution':
        return 'glow-institution';
      case 'student':
        return 'glow-student';
      case 'employer':
        return 'glow-employer';
      default:
        return '';
    }
  }

  submit(): void {
    this.errorMessage = '';
    this.loading = true;
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Welcome to SkillChain!');
      },
      error: (err) => {
        this.loading = false;
        const detail = err?.error?.detail;
        this.errorMessage = typeof detail === 'string' ? detail : 'Login failed.';
        this.toast.error(this.errorMessage);
      },
    });
  }
}
