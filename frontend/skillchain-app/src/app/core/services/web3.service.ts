import { Injectable } from '@angular/core';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

@Injectable({ providedIn: 'root' })
export class Web3Service {
  private address: string | null = null;

  async connectWallet(): Promise<string | null> {
    const eth = typeof window !== 'undefined' ? window.ethereum : undefined;
    if (!eth) {
      return null;
    }
    try {
      const accounts = (await eth.request({
        method: 'eth_requestAccounts',
      })) as string[];
      this.address = accounts?.[0] ?? null;
      return this.address;
    } catch {
      return null;
    }
  }

  getWalletAddress(): string | null {
    return this.address;
  }

  setWalletAddress(addr: string | null): void {
    this.address = addr;
  }
}
