import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [NgClass],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  constructor(public auth: AuthService) {}

  shorten(addr: string | null): string {
    if (!addr || addr.length < 12) {
      return addr ?? '—';
    }
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  roleClass(role: string | null): string {
    switch (role) {
      case 'institution':
        return 'pill-institution';
      case 'student':
        return 'pill-student';
      case 'employer':
        return 'pill-employer';
      default:
        return '';
    }
  }
}
