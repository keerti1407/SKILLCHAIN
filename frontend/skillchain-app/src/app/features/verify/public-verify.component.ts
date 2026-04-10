import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CertificateRecord } from '../../core/models/certificate.model';
import { CertificateService } from '../../core/services/certificate.service';

@Component({
  selector: 'app-public-verify',
  standalone: true,
  templateUrl: './public-verify.component.html',
  styleUrl: './public-verify.component.scss',
})
export class PublicVerifyComponent implements OnInit, OnDestroy {
  certificate: CertificateRecord | null = null;
  notFound = false;
  tokenId: number | null = null;
  loading = false;
  networkError = '';
  private sub: Subscription | null = null;

  constructor(
    public route: ActivatedRoute,
    public certificateService: CertificateService
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe((params) => {
      const raw = params.get('tokenId');
      const id = raw ? parseInt(raw, 10) : NaN;
      if (Number.isNaN(id)) {
        this.notFound = true;
        this.certificate = null;
        this.tokenId = null;
        this.networkError = '';
        this.loading = false;
        return;
      }
      this.tokenId = id;
      this.load(id);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private load(id: number): void {
    this.loading = true;
    this.networkError = '';
    this.notFound = false;
    this.certificate = null;
    this.certificateService.verifyCertificatePublic(id).subscribe({
      next: (c) => {
        this.certificate = c;
        this.notFound = false;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.certificate = null;
        if (err.status === 0) {
          this.networkError =
            'Cannot reach the API. Start the backend at http://localhost:8000 and refresh.';
          this.notFound = false;
        } else {
          this.networkError = '';
          this.notFound = true;
        }
      },
    });
  }
}
