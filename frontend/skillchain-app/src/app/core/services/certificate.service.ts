import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CertificateRecord } from '../models/certificate.model';

export interface IssueCertificatePayload {
  studentName: string;
  studentWallet: string;
  courseName: string;
  grade: string;
  institution: string;
}

export interface IssueCertificateResponse {
  tokenId: number;
}

export interface SuggestSkillsResponse {
  suggestions: string[];
}

export interface BulkCertificateItem {
  studentName: string;
  studentWallet: string;
  courseName: string;
  grade: string;
  institution: string;
}

export interface BulkIssueResultItem {
  studentName: string;
  courseName: string;
  grade: string;
  tokenId: number | null;
  status: 'success' | 'failed';
  error?: string;
}

export interface BulkIssueResponse {
  results: BulkIssueResultItem[];
  successCount: number;
  failedCount: number;
}

@Injectable({ providedIn: 'root' })
export class CertificateService {
  public http = inject(HttpClient);

  issueCertificate(data: IssueCertificatePayload): Observable<IssueCertificateResponse> {
    return this.http.post<IssueCertificateResponse>(
      `${environment.apiBaseUrl}/certificate/issue`,
      data
    );
  }

  bulkIssueCertificates(certificates: BulkCertificateItem[]): Observable<BulkIssueResponse> {
    return this.http.post<BulkIssueResponse>(
      `${environment.apiBaseUrl}/certificate/bulk-issue`,
      { certificates }
    );
  }

  verifyCertificate(tokenId: number): Observable<CertificateRecord> {
    return this.http.get<CertificateRecord>(
      `${environment.apiBaseUrl}/certificate/verify/${tokenId}`
    );
  }

  verifyCertificatePublic(tokenId: number): Observable<CertificateRecord> {
    return this.http.get<CertificateRecord>(
      `${environment.apiBaseUrl}/certificate/public/verify/${tokenId}`
    );
  }

  getStudentCertificates(wallet: string): Observable<CertificateRecord[]> {
    return this.http.get<CertificateRecord[]>(
      `${environment.apiBaseUrl}/certificate/student/${encodeURIComponent(wallet)}`
    );
  }

  /** Body: { certificates: string[] } — course names from the learner's certs */
  suggestSkills(courseNames: string[]): Observable<SuggestSkillsResponse> {
    return this.http.post<SuggestSkillsResponse>(
      `${environment.apiBaseUrl}/ai/suggest-skills`,
      { certificates: courseNames }
    );
  }
}

