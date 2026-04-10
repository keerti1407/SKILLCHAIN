import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent implements OnInit, OnDestroy {
  countdown = 5;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private redirectId: ReturnType<typeof setTimeout> | null = null;

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.timerId = setInterval(() => {
      this.countdown -= 1;
      if (this.countdown <= 0 && this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    }, 1000);

    this.redirectId = setTimeout(() => {
      this.router.navigate(['/home']);
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    if (this.redirectId) {
      clearTimeout(this.redirectId);
    }
  }

  enter(): void {
    this.router.navigate(['/home']);
  }
}
