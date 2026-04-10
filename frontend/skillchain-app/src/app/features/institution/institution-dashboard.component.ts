import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CertificateRecord } from '../../core/models/certificate.model';
import { CertificateService } from '../../core/services/certificate.service';
import { ToastService } from '../../shared/services/toast.service';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-institution-dashboard',
  standalone: true,
  imports: [FormsModule, TopbarComponent],
  templateUrl: './institution-dashboard.component.html',
  styleUrl: './institution-dashboard.component.scss',
})
export class InstitutionDashboardComponent {
  studentName = '';
  courseName = '';
  grade = '';
  studentWallet = '';
  institution = 'NDIM Delhi';

  issued: CertificateRecord[] = [];
  successTokenId: number | null = null;
  showConfetti = false;
  errorMessage = '';
  loadingMint = false;

  constructor(
    public certificate: CertificateService,
    public toast: ToastService
  ) {}

  mint(): void {
    this.errorMessage = '';
    this.loadingMint = true;
    this.certificate
      .issueCertificate({
        studentName: this.studentName,
        courseName: this.courseName,
        grade: this.grade,
        studentWallet: this.studentWallet,
        institution: this.institution,
      })
      .subscribe({
        next: (res) => {
          this.loadingMint = false;
          this.successTokenId = res.tokenId;
          this.showConfetti = true;
          this.toast.success(`Certificate minted successfully (token #${res.tokenId}).`);
          this.certificate.verifyCertificate(res.tokenId).subscribe({
            next: (c) => {
              this.issued = [c, ...this.issued];
            },
            error: () => {
              this.pushLocal(res.tokenId);
            },
          });
          setTimeout(() => {
            this.showConfetti = false;
            this.successTokenId = null;
          }, 4500);
        },
        error: (err) => {
          this.loadingMint = false;
          const d = err?.error?.detail;
          const msg = typeof d === 'string' ? d : 'Could not mint certificate.';
          this.errorMessage = msg;
          if (err.status === 0) {
            this.toast.error('Network error — check that the API is running.');
          } else {
            this.toast.error(msg);
          }
        },
      });
  }

  private pushLocal(tokenId: number): void {
    const stub: CertificateRecord = {
      tokenId,
      studentName: this.studentName,
      studentWallet: this.studentWallet,
      courseName: this.courseName,
      grade: this.grade,
      institution: this.institution,
      issuedDate: new Date().toISOString(),
      isRevoked: false,
    };
    this.issued = [stub, ...this.issued];
  }
}
