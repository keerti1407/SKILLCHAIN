import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);
  private nextId = 0;

  success(text: string, durationMs = 4200): void {
    this.push('success', text, durationMs);
  }

  error(text: string, durationMs = 5500): void {
    this.push('error', text, durationMs);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(type: 'success' | 'error', text: string, durationMs: number): void {
    const id = ++this.nextId;
    this.toasts.update((list) => [...list, { id, type, text }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }
}
