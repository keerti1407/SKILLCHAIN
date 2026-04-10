import { AfterViewInit, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CertificateService } from '../../core/services/certificate.service';
import { Web3Service } from '../../core/services/web3.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements AfterViewInit {
  statMeta = [
    { label: 'Certificates issued', suffix: '+', color: 'purple' },
    { label: 'Avg. verification', suffix: ' sec', color: 'cyan' },
    { label: 'Tamper proof', suffix: '%', color: 'green' },
    { label: 'Fraud tolerance', suffix: '', color: 'pink' },
  ];

  counters = [0, 0, 0, 0];
  private readonly targets = [3400, 5, 100, 0];

  steps = [
    { title: 'Issue', desc: 'Institutions mint NFT certificates on-chain.', color: '#8b5cf6' },
    { title: 'Own', desc: 'Students hold credentials in their wallet.', color: '#06b6d4' },
    { title: 'Verify', desc: 'Employers verify in seconds, anywhere.', color: '#10b981' },
  ];

  features = [
    { title: 'On-chain proof', desc: 'Anchored to Polygon Mumbai testnet.', color: '#8b5cf6' },
    { title: 'Instant verify', desc: 'Public verify route with no login.', color: '#06b6d4' },
    { title: 'Role-based access', desc: 'Institution, student, employer flows.', color: '#ec4899' },
    { title: 'AI skill hints', desc: 'Gemini-powered next skills.', color: '#f97316' },
    { title: 'QR attestations', desc: 'Shareable proof on each certificate.', color: '#10b981' },
    { title: 'Glass UI', desc: 'Modern Web3 experience.', color: '#6366f1' },
  ];

  constructor(
    public auth: AuthService,
    public certificate: CertificateService,
    public web3: Web3Service
  ) {}

  ngAfterViewInit(): void {
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      this.counters = this.targets.map((t) => Math.floor(t * p));
      if (p < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }

  shortWallet(): string {
    const w = this.auth.getWallet();
    if (!w || w.length < 12) {
      return w ?? '—';
    }
    return `${w.slice(0, 6)}…${w.slice(-4)}`;
  }
}
