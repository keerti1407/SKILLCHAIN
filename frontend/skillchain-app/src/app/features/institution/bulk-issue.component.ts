import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CertificateService, BulkCertificateItem, BulkIssueResultItem } from '../../core/services/certificate.service';
import { ToastService } from '../../shared/services/toast.service';
import { CertificateTemplate, getDefaultTemplate } from './template-customizer.component';
import * as Papa from 'papaparse';

interface CsvRow {
  studentName: string;
  courseName: string;
  grade: string;
  walletAddress: string;
  email: string;
}

@Component({
  selector: 'app-bulk-issue',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './bulk-issue.component.html',
  styleUrl: './bulk-issue.component.scss',
})
export class BulkIssueComponent {

  currentStep: 1 | 2 | 3 | 4 = 1;
  parsedRows: CsvRow[] = [];
  fileName = '';
  institution = 'NDIM Delhi';
  courseDate = '';
  isDragOver = false;

  // Minting state
  isMinting = false;
  mintProgress = 0;
  mintCurrent = 0;
  mintTotal = 0;
  mintingComplete = false;
  results: BulkIssueResultItem[] = [];
  successCount = 0;
  failedCount = 0;

  // Saved templates
  savedTemplates: CertificateTemplate[] = [];
  selectedTemplateIndex = 0;

  constructor(
    private certificateService: CertificateService,
    private toast: ToastService,
    private router: Router
  ) {
    this.loadTemplates();
  }

  loadTemplates(): void {
    const active = localStorage.getItem('skillchain_template');
    if (active) {
      try {
        this.savedTemplates = [JSON.parse(active)];
      } catch {
        this.savedTemplates = [getDefaultTemplate()];
      }
    } else {
      this.savedTemplates = [getDefaultTemplate()];
    }
  }

  downloadCsvTemplate(): void {
    const header = 'studentName,courseName,grade,walletAddress,email';
    const sample1 = 'Abhiraj Pal,Blockchain Development,A+,0x2222222222222222222222222222222222222222,abhiraj@example.com';
    const sample2 = 'Ayushi Tiwari,Web3 & DeFi,A,0x3333333333333333333333333333333333333333,ayushi@example.com';
    const sample3 = 'Keerti Singh,Smart Contracts,A+,0x4444444444444444444444444444444444444444,keerti@example.com';
    const csv = [header, sample1, sample2, sample3].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'skillchain_bulk_template.csv';
    link.click();
    URL.revokeObjectURL(url);
    this.toast.success('CSV template downloaded!');
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver = false;
    const files = e.dataTransfer?.files;
    if (files?.length) {
      this.processFile(files[0]);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.processFile(input.files[0]);
    }
  }

  processFile(file: File): void {
    this.fileName = file.name;
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        this.parseCsv(text);
      };
      reader.readAsText(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const XLSX = await import('xlsx');
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          this.parseCsv(csv);
        } catch {
          this.toast.error('Failed to parse Excel file.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      this.toast.error('Please upload a .csv or .xlsx file.');
    }
  }

  parseCsv(text: string): void {
    const result = Papa.parse<CsvRow>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
    });

    if (result.errors.length > 0) {
      this.toast.error(`CSV parse error: ${result.errors[0].message}`);
      return;
    }

    this.parsedRows = result.data.filter(row =>
      row.studentName && row.courseName && row.walletAddress
    );

    if (this.parsedRows.length === 0) {
      this.toast.error('No valid rows found in file. Check column headers.');
      return;
    }

    this.currentStep = 2;
    this.toast.success(`${this.parsedRows.length} students loaded from ${this.fileName}`);
  }

  removeRow(index: number): void {
    this.parsedRows.splice(index, 1);
  }

  goToCustomize(): void {
    if (this.parsedRows.length === 0) {
      this.toast.error('No students to mint certificates for.');
      return;
    }
    this.currentStep = 3;
  }

  goToMint(): void {
    this.currentStep = 4;
  }

  async mintAll(): Promise<void> {
    this.isMinting = true;
    this.mintingComplete = false;
    this.mintTotal = this.parsedRows.length;
    this.mintCurrent = 0;
    this.mintProgress = 0;

    const certificates: BulkCertificateItem[] = this.parsedRows.map(row => ({
      studentName: row.studentName,
      studentWallet: row.walletAddress,
      courseName: row.courseName,
      grade: row.grade || 'N/A',
      institution: this.institution,
    }));

    // Simulate progress animation
    const progressInterval = setInterval(() => {
      if (this.mintProgress < 90) {
        this.mintProgress += 2;
        this.mintCurrent = Math.floor((this.mintProgress / 100) * this.mintTotal);
      }
    }, 100);

    this.certificateService.bulkIssueCertificates(certificates).subscribe({
      next: (res) => {
        clearInterval(progressInterval);
        this.mintProgress = 100;
        this.mintCurrent = this.mintTotal;
        this.results = res.results;
        this.successCount = res.successCount;
        this.failedCount = res.failedCount;
        this.isMinting = false;
        this.mintingComplete = true;
        console.log('Bulk mint results:', res.results);
        if (res.failedCount > 0) {
          this.toast.success(`${res.successCount} certificates minted, ${res.failedCount} failed.`);
        } else {
          this.toast.success(`All ${res.successCount} certificates minted successfully!`);
        }
      },
      error: (err) => {
        clearInterval(progressInterval);
        this.isMinting = false;
        const msg = err?.error?.detail || 'Bulk minting failed.';
        this.toast.error(typeof msg === 'string' ? msg : 'Bulk minting failed.');
      },
    });
  }

  downloadResultsCsv(): void {
    const header = 'studentName,courseName,grade,tokenId,status,error';
    const rows = this.results.map(r =>
      `"${r.studentName}","${r.courseName}","${r.grade}",${r.tokenId ?? ''},${r.status},"${r.error || ''}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'skillchain_bulk_results.csv';
    link.click();
    URL.revokeObjectURL(url);
    this.toast.success('Results CSV downloaded!');
  }

  resetAll(): void {
    this.currentStep = 1;
    this.parsedRows = [];
    this.fileName = '';
    this.results = [];
    this.mintingComplete = false;
    this.mintProgress = 0;
    this.successCount = 0;
    this.failedCount = 0;
  }

  copyTokenId(tokenId: number | null): void {
    if (tokenId === null) return;
    navigator.clipboard.writeText(String(tokenId)).then(() => {
      this.toast.success(`Token ID #${tokenId} copied!`);
    });
  }

  viewCertificate(tokenId: number | null): void {
    if (tokenId === null) return;
    this.router.navigate(['/verify', tokenId]);
  }
}
