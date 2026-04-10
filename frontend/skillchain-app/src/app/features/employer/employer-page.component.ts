import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CertificateRecord } from '../../core/models/certificate.model';
import { CertificateService } from '../../core/services/certificate.service';
import { ToastService } from '../../shared/services/toast.service';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-employer-page',
  standalone: true,
  imports: [FormsModule, TopbarComponent],
  templateUrl: './employer-page.component.html',
  styleUrl: './employer-page.component.scss',
})
export class EmployerPageComponent {
  tokenInput = '';
  status: 'idle' | 'verified' | 'invalid' = 'idle';
  certificate: CertificateRecord | null = null;
  loadingVerify = false;

  constructor(
    public certificateService: CertificateService,
    public toast: ToastService
  ) {}

  verify(): void {
    const id = parseInt(this.tokenInput.trim(), 10);
    if (Number.isNaN(id)) {
      this.status = 'invalid';
      this.certificate = null;
      this.toast.error('Enter a valid numeric token ID.');
      return;
    }
    this.loadingVerify = true;
    this.status = 'idle';
    this.certificate = null;
    this.certificateService.verifyCertificate(id).subscribe({
      next: (c) => {
        this.loadingVerify = false;
        this.certificate = c;
        this.status = 'verified';
        this.toast.success(`Verified: ${c.studentName} — ${c.courseName}`);
      },
      error: (err) => {
        this.loadingVerify = false;
        this.certificate = null;
        this.status = 'invalid';
        if (err.status === 0) {
          this.toast.error('Cannot reach the API. Is the backend running?');
        } else {
          this.toast.error('Certificate not found or access denied.');
        }
      },
    });
  }
}
