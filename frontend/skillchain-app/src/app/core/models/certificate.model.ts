export interface CertificateRecord {
  tokenId: number;
  studentName: string;
  studentWallet: string;
  courseName: string;
  grade: string;
  institution: string;
  issuedDate: string;
  isRevoked: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
  wallet: string;
}
