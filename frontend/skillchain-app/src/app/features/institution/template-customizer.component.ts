import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../shared/services/toast.service';

export interface CertificateTemplate {
  name: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  logoDataUrl: string;
  logoPosition: 'left' | 'center' | 'right';
  institutionName: string;
  certificateTitle: string;
  subtitle: string;
  signatoryName: string;
  signatoryDesignation: string;
  footerNote: string;
  designStyle: 'classic' | 'modern' | 'premium' | 'dark';
  showQrCode: boolean;
  showBlockchainBadge: boolean;
  showLogo: boolean;
  showGradeBadge: boolean;
}

export function getDefaultTemplate(): CertificateTemplate {
  return {
    name: 'Default',
    primaryColor: '#8b5cf6',
    backgroundColor: '#0f0f2e',
    textColor: '#e2e8f0',
    accentColor: '#ec4899',
    logoDataUrl: '',
    logoPosition: 'center',
    institutionName: 'NDIM Delhi',
    certificateTitle: 'Certificate of Completion',
    subtitle: 'This is to certify that',
    signatoryName: 'Dr. Anuj Nain',
    signatoryDesignation: 'Director, NDIM Delhi',
    footerNote: 'Verified on SkillChain Blockchain',
    designStyle: 'classic',
    showQrCode: true,
    showBlockchainBadge: true,
    showLogo: true,
    showGradeBadge: true,
  };
}

@Component({
  selector: 'app-template-customizer',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './template-customizer.component.html',
  styleUrl: './template-customizer.component.scss',
})
export class TemplateCustomizerComponent {
  template: CertificateTemplate = getDefaultTemplate();

  designStyles: { key: CertificateTemplate['designStyle']; label: string; desc: string }[] = [
    { key: 'classic', label: 'Classic', desc: 'Traditional border design' },
    { key: 'modern', label: 'Modern', desc: 'Clean minimal design' },
    { key: 'premium', label: 'Premium', desc: 'Gold accents, luxury feel' },
    { key: 'dark', label: 'Dark', desc: 'Dark bg, neon accents' },
  ];

  @ViewChild('logoInput') logoInput!: ElementRef<HTMLInputElement>;

  constructor(private toast: ToastService) {
    this.loadSavedTemplate();
  }

  onLogoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
      this.toast.error('Logo must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.template.logoDataUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.template.logoDataUrl = '';
    if (this.logoInput?.nativeElement) {
      this.logoInput.nativeElement.value = '';
    }
  }

  selectStyle(style: CertificateTemplate['designStyle']): void {
    this.template.designStyle = style;
    switch (style) {
      case 'classic':
        this.template.primaryColor = '#8b5cf6';
        this.template.backgroundColor = '#0f0f2e';
        this.template.textColor = '#e2e8f0';
        this.template.accentColor = '#ec4899';
        break;
      case 'modern':
        this.template.primaryColor = '#06b6d4';
        this.template.backgroundColor = '#0a1628';
        this.template.textColor = '#f1f5f9';
        this.template.accentColor = '#3b82f6';
        break;
      case 'premium':
        this.template.primaryColor = '#d4a847';
        this.template.backgroundColor = '#1a1205';
        this.template.textColor = '#fef3c7';
        this.template.accentColor = '#f59e0b';
        break;
      case 'dark':
        this.template.primaryColor = '#10b981';
        this.template.backgroundColor = '#030712';
        this.template.textColor = '#d1fae5';
        this.template.accentColor = '#22d3ee';
        break;
    }
  }

  saveTemplate(): void {
    const key = `skillchain_template_${this.template.institutionName.replace(/\s+/g, '_').toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(this.template));
    localStorage.setItem('skillchain_template', JSON.stringify(this.template));
    this.toast.success('Template saved successfully!');
  }

  loadSavedTemplate(): void {
    const saved = localStorage.getItem('skillchain_template');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CertificateTemplate;
        this.template = { ...getDefaultTemplate(), ...parsed };
      } catch {
        // ignore parse errors
      }
    }
  }

  downloadSamplePDF(): void {
    this.toast.success('Sample PDF download initiated! (Demo mode)');
  }

  getPreviewBorderStyle(): Record<string, string> {
    const t = this.template;
    switch (t.designStyle) {
      case 'classic':
        return {
          border: `3px double ${t.primaryColor}`,
          'box-shadow': `inset 0 0 0 6px ${t.backgroundColor}, inset 0 0 0 8px ${t.primaryColor}`,
        };
      case 'modern':
        return {
          border: `2px solid ${t.primaryColor}`,
        };
      case 'premium':
        return {
          border: `3px solid ${t.primaryColor}`,
          'box-shadow': `0 0 30px ${t.primaryColor}40, inset 0 0 0 6px ${t.backgroundColor}, inset 0 0 0 8px ${t.primaryColor}60`,
        };
      case 'dark':
        return {
          border: `2px solid ${t.primaryColor}`,
          'box-shadow': `0 0 20px ${t.primaryColor}60, 0 0 40px ${t.accentColor}30`,
        };
    }
  }
}
