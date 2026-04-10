import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import QRCode from 'qrcode';
import { environment } from '../../../environments/environment';
import { CertificateRecord } from '../../core/models/certificate.model';
import { AuthService } from '../../core/services/auth.service';
import { CertificateService } from '../../core/services/certificate.service';
import { Web3Service } from '../../core/services/web3.service';
import { ToastService } from '../../shared/services/toast.service';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [DatePipe, TopbarComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss',
})
export class StudentDashboardComponent implements OnInit {
  certificates: CertificateRecord[] = [];
  qrMap: Record<number, string> = {};
  flipped = new Set<number>();
  skills: string[] = ['—', '—', '—'];
  loadingSkills = false;
  loadingCerts = false;
  loadError = '';
  skillsError = '';
  connecting = false;

  constructor(
    public auth: AuthService,
    public certificate: CertificateService,
    public web3: Web3Service,
    public toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCerts();
  }

  async connectWallet(): Promise<void> {
    this.connecting = true;
    const addr = await this.web3.connectWallet();
    this.connecting = false;
    if (addr) {
      this.web3.setWalletAddress(addr);
      this.loadCerts();
      this.toast.success('Wallet connected.');
    }
  }

  loadCerts(): void {
    this.loadError = '';
    const wallet = this.auth.getWallet();
    if (!wallet) {
      this.certificates = [];
      this.qrMap = {};
      return;
    }
    this.loadingCerts = true;
    this.certificate.getStudentCertificates(wallet).subscribe({
      next: async (certs) => {
        this.certificates = certs;
        this.loadingCerts = false;
        await this.populateQr();
      },
      error: (err) => {
        this.loadingCerts = false;
        this.certificates = [];
        this.qrMap = {};
        if (err.status === 0) {
          this.loadError =
            'Cannot reach the API. Start the backend at http://localhost:8000 and try again.';
          this.toast.error('Cannot reach the SkillChain API.');
        } else {
          const d = err?.error?.detail;
          this.loadError = typeof d === 'string' ? d : 'Could not load certificates.';
          this.toast.error(this.loadError);
        }
      },
    });
  }

  private async populateQr(): Promise<void> {
    const map: Record<number, string> = {};
    const base = environment.appBaseUrl.replace(/\/$/, '');
    for (const c of this.certificates) {
      const url = `${base}/verify/${c.tokenId}`;
      map[c.tokenId] = await QRCode.toDataURL(url, { width: 200, margin: 1 });
    }
    this.qrMap = map;
  }

  toggleFlip(id: number): void {
    if (this.flipped.has(id)) {
      this.flipped.delete(id);
    } else {
      this.flipped.add(id);
    }
  }

  isFlipped(id: number): boolean {
    return this.flipped.has(id);
  }

  suggest(): void {
    if (this.certificates.length === 0) {
      return;
    }
    this.skillsError = '';
    this.loadingSkills = true;
    const courseNames = this.certificates.map((c) => c.courseName).filter(Boolean);
    this.certificate.suggestSkills(courseNames).subscribe({
      next: (res) => {
        this.loadingSkills = false;
        this.skills = res.suggestions.slice(0, 3);
        while (this.skills.length < 3) {
          this.skills.push('—');
        }
        this.toast.success('Skill suggestions updated.');
      },
      error: (err) => {
        this.loadingSkills = false;
        if (err.status === 0) {
          this.skillsError = 'Network error while contacting the AI service.';
          this.toast.error('Network error — check your connection.');
        } else {
          this.skillsError = 'Could not load suggestions. Showing defaults.';
          this.toast.error('Using fallback skill suggestions.');
        }
        this.skills = ['Blockchain Security', 'Smart Contract Testing', 'DeFi Protocol Design'];
      },
    });
  }
}
