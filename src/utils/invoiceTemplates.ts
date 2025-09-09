export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  template: 'a4professional';
}

export const templates: InvoiceTemplate[] = [
  {
    id: 'a4professional',
    name: 'A4 Professional',
    description: 'Premium A4-sized invoice optimized for printing',
    template: 'a4professional',
  }
];

export const defaultTemplate = 'a4professional';

export interface InvoiceSettings {
  template: string;
  showLogo: boolean;
  color: string;
  includeShipping: boolean;
  notes: string;
  termsAndConditions: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchName: string;
    ifscCode: string;
  };
  companyDetails: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    gstin: string;
  };
  customization: {
    paperSize: 'a4' | 'letter' | 'legal';
    orientation: 'portrait' | 'landscape';
    fontFamily: string;
    showSignature: boolean;
    showQrCode: boolean;
    showFooter: boolean;
    showHeaderImage: boolean;
    headerImageUrl: string;
    footerText: string;
    // New customization options
    showBorders: boolean;
    showWatermark: boolean;
    watermarkText: string;
    showItemImages: boolean;
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    logoPosition: 'left' | 'center' | 'right';
    showPaymentQR: boolean;
    paymentQRUrl: string;
    accentColor: string;
    secondaryColor: string;
  };
}

export const defaultInvoiceSettings: InvoiceSettings = {
  template: 'a4professional',
  showLogo: true,
  color: '#7C3AED', // Default purple theme color
  includeShipping: true,
  notes: 'Thank you for your business!',
  termsAndConditions: 'Payment due within 30 days. Late payment subject to interest charges.',
  bankDetails: {
    accountName: 'CraftShop',
    accountNumber: '123456789012',
    bankName: 'National Bank',
    branchName: 'Main Branch',
    ifscCode: 'NATB0001234',
  },
  companyDetails: {
    name: 'CraftShop',
    address: '123 Craft Street, Design District, Mumbai - 400001',
    phone: '+91 98765 43210',
    email: 'contact@craftshop.com',
    website: 'www.craftshop.com',
    gstin: '27AABCS1234Z1Z5',
  },
  customization: {
    paperSize: 'a4',
    orientation: 'portrait',
    fontFamily: 'Inter, sans-serif',
    showSignature: true,
    showQrCode: false,
    showFooter: true,
    showHeaderImage: false,
    headerImageUrl: '',
    footerText: 'This is a computer-generated invoice and does not require a signature.',
    // New default values for the new customization options
    showBorders: true,
    showWatermark: false,
    watermarkText: 'PAID',
    showItemImages: false,
    dateFormat: 'DD/MM/YYYY',
    logoPosition: 'left',
    showPaymentQR: false,
    paymentQRUrl: '',
    accentColor: '#D1C4E9',
    secondaryColor: '#F3E5F5',
  },
};
