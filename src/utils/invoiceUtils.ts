import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  // In a real app, this would fetch the last invoice number from the database
  // and increment it. For demo purposes, we'll use a random number.
  const orderNumber = Math.floor(1000 + Math.random() * 9000);
  
  return `AS${year}${month}/${orderNumber.toString().padStart(4, '0')}`;
};

export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
  return `₹${numAmount.toLocaleString('en-IN')}`;
};

export const parsePrice = (priceString: string): number => {
  // Remove all non-numeric characters except decimal point
  const numericString = priceString.replace(/[^\d.]/g, '');
  // Parse the numeric string to a float
  const price = parseFloat(numericString);
  // Return 0 if the result is NaN, otherwise return the parsed price
  return isNaN(price) ? 0 : price;
};

export const numberToWords = (num: number): string => {
  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const formatTens = (num: number): string => {
    if (num < 10) return single[num];
    else if (num < 20) return double[num - 10];
    else {
      return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + single[num % 10] : '');
    }
  };

  if (num === 0) return 'Zero';
  
  let words = '';
  
  if (num >= 100000) {
    words += formatTens(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  
  if (num >= 1000) {
    words += formatTens(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  
  if (num >= 100) {
    words += formatTens(Math.floor(num / 100)) + ' Hundred ';
    num %= 100;
  }
  
  if (num > 0) {
    if (words !== '') words += 'and ';
    words += formatTens(num);
  }
  
  return words.trim();
};

// Helper function to adjust color brightness
const adjustColor = (color: string, amount: number): string => {
  // Remove the leading '#' if it exists
  let hex = color.replace('#', '');
  
  // Convert to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust brightness
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const generateAndDownloadInvoice = (order: any, template = 'basic', settings?: any) => {
  // Create a new window with the invoice content
  const invoiceWindow = window.open('', '_blank');
  if (!invoiceWindow) return;

  // Apply selected template
  let invoiceContent = '';
  
  switch (template) {
    case 'tax':
      invoiceContent = generateTaxInvoice(order, settings);
      break;
    case 'detailed':
      invoiceContent = generateDetailedInvoice(order, settings);
      break;
    case 'professional':
      invoiceContent = generateProfessionalInvoice(order, settings);
      break;
    case 'a4professional':
      invoiceContent = generateA4ProfessionalInvoice(order, settings);
      break;
    default:
      invoiceContent = generateBasicInvoice(order, settings);
  }

  // Write the content to the new window
  invoiceWindow.document.write(invoiceContent);
  invoiceWindow.document.close();

  // Print the invoice
  invoiceWindow.print();
};

// Basic Invoice Template
const generateBasicInvoice = (order: any, settings?: any) => {
  const items = order.items.split(',').map((item: string) => {
    const [name, quantity] = item.trim().split('(x');
    const qty = quantity.replace(')', '');
    const unitPrice = parsePrice(order.amount) / parseInt(qty);
    const totalPrice = unitPrice * parseInt(qty);
    
    return { name, qty, unitPrice, totalPrice };
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .details { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <p>Invoice Number: ${order.id}</p>
          <p>Date: ${order.date}</p>
        </div>
        
        <div class="details">
          <h2>Customer Details</h2>
          <p>Name: ${order.customer}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>₹${item.unitPrice.toFixed(2)}</td>
                <td>₹${item.totalPrice.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          <p>Total Amount: ${order.amount}</p>
        </div>
      </body>
    </html>
  `;
};

// Tax Invoice Template (similar to the image provided)
const generateTaxInvoice = (order: any, settings?: any) => {
  // Calculate total price and GST
  const totalPrice = parsePrice(order.amount);
  const gstRate = 18; // Default GST rate
  const taxableValue = totalPrice * 100 / (100 + gstRate);
  const gstAmount = totalPrice - taxableValue;
  
  // Parse items
  const items = order.items.split(',').map((item: string) => {
    const [name, quantity] = item.trim().split('(x');
    const qty = quantity.replace(')', '');
    const unitPrice = taxableValue / parseInt(qty);
    return { name, qty, unitPrice, totalPrice: unitPrice * parseInt(qty) };
  });

  const totalInWords = numberToWords(totalPrice) + " Only";

  const bankDetails = settings?.bankDetails || {
    accountName: 'CraftShop',
    bankName: 'HDFC Bank',
    accountNumber: '50100125645789',
    branchName: 'Main Branch',
    ifscCode: 'HDFC0001234'
  };

  // Get customer details from localStorage
  let customerDetails = {
    phone: '',
    email: '',
    address: ''
  };

  try {
    const savedCustomers = localStorage.getItem('customers');
    if (savedCustomers) {
      const customers = JSON.parse(savedCustomers);
      const customer = customers.find((c: any) => c.name === order.customer);
      if (customer) {
        customerDetails = {
          phone: customer.phone || '',
          email: customer.email || '',
          address: customer.address || ''
        };
      }
    }
  } catch (error) {
    console.error('Error loading customer details:', error);
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tax Invoice ${order.id}</title>
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 12px;
            color: #333;
          }
          .container { 
            border: 1px solid #000;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #000; 
            padding: 10px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            color: #1a1a1a;
            font-size: 24px;
          }
          .company-details { 
            display: flex; 
            border-bottom: 1px solid #000; 
            margin-bottom: 20px;
          }
          .logo { 
            width: 20%; 
            padding: 10px; 
            border-right: 1px solid #000;
            text-align: center;
          }
          .address { 
            width: 80%; 
            padding: 10px;
            line-height: 1.6;
          }
          .invoice-details { 
            display: flex; 
            border-bottom: 1px solid #000;
            margin-bottom: 20px;
          }
          .invoice-left { 
            width: 50%; 
            padding: 10px; 
            border-right: 1px solid #000;
          }
          .invoice-right { 
            width: 50%; 
            padding: 10px;
          }
          .party-details { 
            display: flex; 
            border-bottom: 1px solid #000;
            margin-bottom: 20px;
          }
          .consignee { 
            width: 50%; 
            padding: 10px; 
            border-right: 1px solid #000;
          }
          .buyer { 
            width: 50%; 
            padding: 10px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td { 
            border: 1px solid #000; 
            padding: 8px; 
            text-align: left;
          }
          th {
            background-color: #f8f8f8;
            font-weight: bold;
          }
          .amount-in-words { 
            padding: 10px; 
            border: 1px solid #000;
            margin-bottom: 20px;
            background-color: #f8f8f8;
          }
          .tax-details { 
            display: flex; 
            border: 1px solid #000;
            margin-bottom: 20px;
          }
          .hsn { 
            width: 30%; 
            padding: 10px; 
            border-right: 1px solid #000;
          }
          .tax-calculation { 
            width: 70%; 
            padding: 10px;
          }
          .declaration { 
            display: flex;
            border: 1px solid #000;
            margin-bottom: 20px;
          }
          .declaration-text { 
            width: 50%; 
            padding: 10px; 
            border-right: 1px solid #000;
          }
          .bank-details { 
            width: 50%; 
            padding: 10px;
          }
          .row { 
            display: flex; 
            border-bottom: 1px solid #000;
          }
          .cell { 
            padding: 5px; 
            border-right: 1px solid #000;
          }
          .total { 
            font-weight: bold;
            text-align: right;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #000;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px;
            color: rgba(0, 0, 0, 0.1);
            pointer-events: none;
            z-index: -1;
          }
          .paid-stamp {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-25deg);
            font-size: 80px;
            color: ${order.status === 'paid' ? 'rgba(46, 125, 50, 0.15)' : 'transparent'};
            font-weight: 700;
            border: ${order.status === 'paid' ? '10px solid rgba(46, 125, 50, 0.15)' : 'none'};
            padding: 10px 20px;
            border-radius: 10px;
            pointer-events: none;
            z-index: 10;
          }
        </style>
      </head>
      <body>
        <div class="watermark">ORIGINAL</div>
        <div class="paid-stamp">${order.status === 'paid' ? 'PAID' : ''}</div>
        <div class="container">
          <div class="header">
            <h1>TAX INVOICE</h1>
            <p>GSTIN: 27ABCDE1234F1Z5</p>
          </div>
          
          <div class="company-details">
            <div class="logo">
              <img src="https://via.placeholder.com/100" alt="Company Logo" style="max-width: 100px;">
            </div>
            <div class="address">
              <h3>CraftShop</h3>
              <p>123 Business Street</p>
              <p>Mumbai, Maharashtra - 400001</p>
              <p>Phone: +91 22 1234 5678</p>
              <p>Email: info@craftshop.com</p>
            </div>
          </div>
          
          <div class="invoice-details">
            <div class="invoice-left">
              <p><strong>Invoice No:</strong> ${order.id}</p>
              <p><strong>Date:</strong> ${order.date}</p>
              <p><strong>Order No:</strong> ${order.orderId || order.id.replace("INV", "ORD")}</p>
            </div>
            <div class="invoice-right">
              <p><strong>Due Date:</strong> ${new Date(new Date(order.date).getTime() + 30*24*60*60*1000).toLocaleDateString()}</p>
              <p><strong>Payment Terms:</strong> Net 30</p>
              <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
            </div>
          </div>
          
          <div class="party-details">
            <div class="consignee">
              <h3>Bill To:</h3>
              <p><strong>${order.customer}</strong></p>
              <p>${customerDetails.address}</p>
              <p>Phone: ${customerDetails.phone}</p>
              <p>Email: ${customerDetails.email}</p>
            </div>
            <div class="buyer">
              <h3>Ship To:</h3>
              <p><strong>${order.customer}</strong></p>
              <p>${customerDetails.address}</p>
              <p>Phone: ${customerDetails.phone}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Description</th>
                <th>HSN/SAC</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.name}</td>
                  <td>9983</td>
                  <td>${item.qty}</td>
                  <td>₹${item.unitPrice.toFixed(2)}</td>
                  <td>₹${item.totalPrice.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="amount-in-words">
            <p><strong>Amount in words:</strong> ${totalInWords}</p>
          </div>
          
          <div class="tax-details">
            <div class="hsn">
              <p><strong>HSN/SAC:</strong> 9983</p>
              <p><strong>GSTIN:</strong> 27ABCDE1234F1Z5</p>
              <p><strong>Place of Supply:</strong> Maharashtra (27)</p>
            </div>
            <div class="tax-calculation">
              <table>
                <tr>
                  <td>Taxable Value</td>
                  <td>₹${taxableValue.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>CGST @ 9%</td>
                  <td>₹${(gstAmount/2).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>SGST @ 9%</td>
                  <td>₹${(gstAmount/2).toFixed(2)}</td>
                </tr>
                <tr class="total">
                  <td>Total Amount</td>
                  <td>₹${totalPrice.toFixed(2)}</td>
                </tr>
              </table>
            </div>
          </div>
          
          <div class="declaration">
            <div class="declaration-text">
              <h3>Terms & Conditions:</h3>
              <p>1. Goods once sold will not be taken back</p>
              <p>2. Interest @ 24% p.a. will be charged if the payment is not made within the stipulated time</p>
              <p>3. Subject to Mumbai Jurisdiction</p>
              <p>4. E. & O.E.</p>
            </div>
            <div class="bank-details">
              <h3>Bank Details:</h3>
              <p><strong>Account Name:</strong> ${bankDetails.accountName}</p>
              <p><strong>Bank Name:</strong> ${bankDetails.bankName}</p>
              <p><strong>Account No:</strong> ${bankDetails.accountNumber}</p>
              <p><strong>Branch:</strong> ${bankDetails.branchName}</p>
              <p><strong>IFSC Code:</strong> ${bankDetails.ifscCode}</p>
            </div>
          </div>
          
          <div class="footer">
            <p>This is a computer generated invoice. No signature required.</p>
            <p>Thank you for your business!</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Detailed Invoice Template
const generateDetailedInvoice = (order: any, settings?: any) => {
  // Calculate total price and GST
  const totalPrice = parsePrice(order.amount);
  const gstRate = 18; // Default GST rate
  const taxableValue = totalPrice * 100 / (100 + gstRate);
  const gstAmount = totalPrice - taxableValue;
  
  // Parse items
  const items = order.items.split(',').map((item: string) => {
    const [name, quantity] = item.trim().split('(x');
    const qty = quantity.replace(')', '');
    const unitPrice = taxableValue / parseInt(qty);
    return { name, qty, unitPrice, totalPrice: unitPrice * parseInt(qty) };
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Detailed Invoice ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; }
          .invoice-id { text-align: right; }
          .company-info { margin-bottom: 20px; }
          .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .customer, .details { width: 48%; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .summary { display: flex; justify-content: space-between; }
          .terms { width: 48%; }
          .totals { width: 48%; text-align: right; }
          .total-row { font-weight: bold; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; }
          .signature { margin-top: 70px; display: flex; justify-content: space-between; }
          .signature-box { width: 48%; text-align: center; }
          .divider { border-top: 1px solid #ddd; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">CraftShop</div>
          <div class="invoice-id">
            <h1>INVOICE</h1>
            <p>Invoice #: ${order.id}</p>
            <p>Date: ${order.date}</p>
            <p>Due Date: ${new Date(new Date(order.date).getTime() + 30*24*60*60*1000).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div class="company-info">
          <p>CraftShop</p>
          <p>123 Craft Street, Design District</p>
          <p>Mumbai, Maharashtra - 400001</p>
          <p>Phone: +91 98765 43210 | Email: contact@craftshop.com</p>
          <p>GSTIN: 27AABCS1234Z1Z5</p>
        </div>
        
        <div class="parties">
          <div class="customer">
            <h3>Bill To:</h3>
            <p><strong>${order.customer}</strong></p>
            <p>Customer Address</p>
            <p>Phone: </p>
            <p>Email: </p>
          </div>
          <div class="details">
            <h3>Order Details:</h3>
            <p>Order #: ${order.id.replace("INV", "ORD")}</p>
            <p>Order Date: ${order.date}</p>
            <p>Payment Method: </p>
            <p>Shipping Method: Standard Delivery</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item & Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>GST</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>₹${item.unitPrice.toFixed(2)}</td>
                <td>${gstRate}%</td>
                <td>₹${item.totalPrice.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <div class="terms">
            <h3>Terms & Conditions:</h3>
            <p>1. Payment is due within 30 days</p>
            <p>2. Please include the invoice number with your payment</p>
            <p>3. Late payments are subject to a 2% monthly interest charge</p>
            <p>4. For any queries regarding this invoice, please contact our accounts department</p>
          </div>
          <div class="totals">
            <p>Subtotal: ₹${taxableValue.toFixed(2)}</p>
            <p>GST (${gstRate}%): ₹${gstAmount.toFixed(2)}</p>
            <p>Shipping: ₹0.00</p>
            <div class="divider"></div>
            <p class="total-row">Total: ${formatCurrency(totalPrice)}</p>
            <p class="total-row">Balance Due: ${formatCurrency(totalPrice)}</p>
          </div>
        </div>
        
        <div class="signature">
          <div class="signature-box">
            <p>Customer Signature</p>
            <div style="margin-top: 40px;">____________________</div>
          </div>
          <div class="signature-box">
            <p>For CraftShop</p>
            <div style="margin-top: 40px;">____________________</div>
            <p>Authorized Signatory</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This invoice was generated electronically and is valid without a signature.</p>
        </div>
      </body>
    </html>
  `;
};

// Professional Invoice Template
const generateProfessionalInvoice = (order: any, settings?: any) => {
  const color = settings?.color || '#7C3AED'; // Default to purple if no color specified
  
  // Calculate total price and GST
  const totalPrice = parsePrice(order.amount);
  const gstRate = 18; // Default GST rate
  const taxableValue = totalPrice * 100 / (100 + gstRate);
  const gstAmount = totalPrice - taxableValue;
  
  // Parse items
  const items = order.items.split(',').map((item: string) => {
    const [name, quantity] = item.trim().split('(x');
    const qty = quantity ? quantity.replace(')', '') : '1';
    const unitPrice = taxableValue / parseInt(qty);
    return { name, qty, unitPrice, totalPrice: unitPrice * parseInt(qty) };
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Professional Invoice ${order.id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body { 
            font-family: 'Inter', sans-serif; 
            margin: 0; 
            padding: 0; 
            color: #1a1a1a;
            background-color: #f8f9fa;
          }
          .container { 
            max-width: 800px; 
            margin: 40px auto; 
            background: white;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            border-radius: 12px;
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, ${color}, ${adjustColor(color, -20)});
            color: white; 
            padding: 40px;
            position: relative;
          }
          .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, ${color}, ${adjustColor(color, 20)});
          }
          .header-content { 
            display: flex; 
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
          }
          .logo { 
            font-size: 32px; 
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .invoice-info {
            text-align: right;
            background: rgba(255, 255, 255, 0.1);
            padding: 15px 20px;
            border-radius: 8px;
          }
          .invoice-info p {
            margin: 5px 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .invoice-title { 
            text-align: center;
            margin-top: 20px;
          }
          .invoice-title h1 { 
            margin: 0; 
            font-size: 48px;
            font-weight: 700;
            letter-spacing: -1px;
          }
          .invoice-title p { 
            margin: 10px 0 0 0; 
            opacity: 0.9;
            font-size: 16px;
          }
          .info-section { 
            padding: 40px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 40px;
          }
          .info-item h3 { 
            color: ${color};
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
          }
          .info-item p { 
            margin: 8px 0; 
            font-size: 15px;
            line-height: 1.5;
          }
          .items-section { 
            padding: 40px;
            background-color: white;
          }
          table { 
            width: 100%; 
            border-collapse: separate;
            border-spacing: 0;
          }
          th { 
            background-color: #f8f9fa;
            padding: 15px;
            text-align: left;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6c757d;
            border-bottom: 2px solid #e9ecef;
          }
          td { 
            padding: 15px;
            border-bottom: 1px solid #e9ecef;
            font-size: 14px;
            color: #495057;
          }
          tr:last-child td {
            border-bottom: none;
          }
          .summary-section { 
            padding: 40px;
            background-color: #f8f9fa;
          }
          .summary-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 40px;
          }
          .terms h3 {
            color: ${color};
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
          }
          .terms p { 
            font-size: 14px;
            margin: 8px 0;
            color: #6c757d;
            line-height: 1.5;
          }
          .totals { 
            text-align: right;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
          }
          .total-row { 
            font-weight: 600;
            font-size: 16px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e9ecef;
          }
          .total-row span { 
            color: ${color};
            font-weight: 700;
          }
          .footer { 
            margin-top: 40px;
            text-align: center;
            font-size: 13px;
            color: #6c757d;
            padding: 20px;
            border-top: 1px solid #e9ecef;
          }
          .signature { 
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box { 
            width: 45%;
            text-align: center;
          }
          .signature-line { 
            margin-top: 30px;
            border-top: 1px solid #e9ecef;
            padding-top: 10px;
            font-size: 13px;
            color: #6c757d;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(0, 0, 0, 0.03);
            font-weight: 700;
            pointer-events: none;
            z-index: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="watermark">CraftShop</div>
            <div class="header-content">
              <div class="logo">CraftShop</div>
              <div class="invoice-info">
                <p>Invoice #: ${order.id}</p>
                <p>Date: ${order.date}</p>
                <p>Due Date: ${new Date(new Date(order.date).getTime() + 30*24*60*60*1000).toLocaleDateString()}</p>
              </div>
            </div>
            <div class="invoice-title">
              <h1>INVOICE</h1>
              <p>For professional services rendered</p>
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-grid">
              <div class="info-item">
                <h3>BILLED TO</h3>
                <p><strong>${order.customer}</strong></p>
                <p>Customer Address</p>
                <p>Phone: </p>
                <p>Email: </p>
              </div>
              <div class="info-item">
                <h3>PAYMENT DETAILS</h3>
                <p><strong>Bank Name:</strong> National Bank</p>
                <p><strong>Account Name:</strong> CraftShop</p>
                <p><strong>Account Number:</strong> 123456789012</p>
                <p><strong>IFSC Code:</strong> NATB0001234</p>
              </div>
            </div>
          </div>
          
          <div class="items-section">
            <table>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>GST</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item, index) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>₹${item.unitPrice.toFixed(2)}</td>
                    <td>${gstRate}%</td>
                    <td>₹${item.totalPrice.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="summary-section">
            <div class="summary-grid">
              <div class="terms">
                <h3>Terms & Conditions</h3>
                <p>1. Payment is due within 30 days of invoice date</p>
                <p>2. Please include the invoice number with your payment</p>
                <p>3. Late payments are subject to a 2% monthly interest charge</p>
                <p>4. For any queries regarding this invoice, please contact our accounts department</p>
              </div>
              <div class="totals">
                <p>Subtotal: ₹${taxableValue.toFixed(2)}</p>
                <p>GST (${gstRate}%): ₹${gstAmount.toFixed(2)}</p>
                <p>Shipping: ₹0.00</p>
                <p class="total-row">Total Amount: <span>${formatCurrency(totalPrice)}</span></p>
                <p class="total-row">Balance Due: <span>${formatCurrency(totalPrice)}</span></p>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This invoice was generated electronically and is valid without a signature.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// A4 Professional Invoice Template
const generateA4ProfessionalInvoice = (order: any, settings?: any) => {
  const companySettings = settings?.companyDetails || {
    name: 'CraftShop',
    address: '123 Craft Street, Design District, Mumbai - 400001',
    phone: '+91 98765 43210',
    email: 'contact@craftshop.com',
    website: 'www.craftshop.com',
    gstin: '27AABCS1234Z1Z5'
  };
  
  const customization = settings?.customization || {
    paperSize: 'a4',
    orientation: 'portrait',
    fontFamily: 'Inter, sans-serif',
    showSignature: true,
    showQrCode: false,
    showFooter: true,
    showHeaderImage: false,
    headerImageUrl: '',
    footerText: 'This is a computer-generated invoice and does not require a signature.'
  };
  
  // Default theme color
  const color = settings?.color || '#7C3AED';
  
  // Calculate total price and GST
  const totalPrice = parsePrice(order.amount);
  const gstRate = 18; // Default GST rate
  const taxableValue = totalPrice * 100 / (100 + gstRate);
  const gstAmount = totalPrice - taxableValue;
  
  // Parse items
  const items = order.items.split(',').map((item: string) => {
    const [name, quantity] = item.trim().split('(x');
    const qty = quantity ? quantity.replace(')', '') : '1';
    const unitPrice = taxableValue / parseInt(qty);
    return { name, qty, unitPrice, totalPrice: unitPrice * parseInt(qty) };
  });

  // Get current date for invoice generation
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const totalInWords = numberToWords(totalPrice) + " Only";

  const bankDetails = settings?.bankDetails || {
    accountName: 'CraftShop',
    bankName: 'HDFC Bank',
    accountNumber: '50100125645789',
    branchName: 'Main Branch',
    ifscCode: 'HDFC0001234'
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>A4 Professional Invoice ${order.id}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=${customization.fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap');
          
          :root {
            --primary-color: ${color};
            --text-color: #262626;
            --border-color: #e0e0e0;
            --bg-light: #f9f9f9;
            --success-color: #2e7d32;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: ${customization.fontFamily};
            color: var(--text-color);
            background-color: white;
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .page {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            position: relative;
            background-color: white;
            margin: 0 auto;
            ${customization.orientation === 'landscape' ? 'transform: rotate(90deg); transform-origin: center;' : ''}
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 20px;
          }
          
          .logo-company {
            display: flex;
            flex-direction: column;
          }
          
          .company-name {
            font-size: 24px;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 5px;
          }
          
          .company-details {
            font-size: 12px;
            color: #555;
            max-width: 250px;
          }
          
          .invoice-title {
            text-align: right;
          }
          
          .invoice-title h1 {
            font-size: 32px;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 10px;
          }
          
          .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          
          .client-details, .invoice-details {
            padding: 15px;
            background-color: var(--bg-light);
            border-radius: 5px;
          }
          
          .section-title {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--primary-color);
            margin-bottom: 10px;
          }
          
          .client-details p, .invoice-details p {
            font-size: 13px;
            margin-bottom: 5px;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          .items-table th, .items-table td {
            padding: 12px 10px;
            text-align: left;
            font-size: 13px;
            border-bottom: 1px solid var(--border-color);
          }
          
          .items-table th {
            background-color: var(--primary-color);
            color: white;
            font-weight: 600;
          }
          
          .items-table tr:nth-child(even) {
            background-color: var(--bg-light);
          }
          
          .items-table .qty {
            text-align: center;
            width: 8%;
          }
          
          .items-table .price, .items-table .amount {
            text-align: right;
            width: 15%;
          }
          
          .items-table .desc {
            width: 47%;
          }
          
          .items-table .tax {
            text-align: center;
            width: 15%;
          }
          
          .summary {
            display: flex;
            justify-content: flex-end;
          }
          
          .totals {
            width: 300px;
          }
          
          .totals table {
            width: 100%;
          }
          
          .totals table td {
            padding: 5px 0;
            font-size: 13px;
          }
          
          .totals table td:last-child {
            text-align: right;
          }
          
          .grand-total {
            font-size: 16px;
            font-weight: 700;
            color: var(--primary-color);
            border-top: 2px solid var(--primary-color);
            padding-top: 5px;
            margin-top: 5px;
          }
          
          .amount-in-words {
            margin: 20px 0;
            padding: 10px;
            border: 1px dashed var(--border-color);
            font-size: 13px;
            background-color: var(--bg-light);
          }
          
          .notes {
            margin-bottom: 20px;
            font-size: 13px;
          }
          
          .notes strong {
            display: block;
            margin-bottom: 5px;
            font-size: 14px;
          }
          
          .footer {
            display: ${customization.showFooter ? 'grid' : 'none'};
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 30px;
            font-size: 12px;
            border-top: 1px solid var(--border-color);
            padding-top: 20px;
          }
          
          .bank-details {
            padding: 10px;
            background-color: var(--bg-light);
            border-radius: 5px;
          }
          
          .signature {
            display: ${customization.showSignature ? 'flex' : 'none'};
            flex-direction: column;
            align-items: flex-end;
          }
          
          .signature-line {
            width: 200px;
            border-top: 1px solid var(--border-color);
            margin-top: 50px;
            text-align: center;
            padding-top: 10px;
          }
          
          .paid-stamp {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-25deg);
            font-size: 80px;
            color: ${order.status === 'paid' ? 'rgba(46, 125, 50, 0.15)' : 'transparent'};
            font-weight: 700;
            border: ${order.status === 'paid' ? '10px solid rgba(46, 125, 50, 0.15)' : 'none'};
            padding: 10px 20px;
            border-radius: 10px;
            pointer-events: none;
            z-index: 10;
          }
          
          .footer-text {
            text-align: center;
            font-size: 11px;
            color: #777;
            margin-top: 20px;
          }
          
          .qr-code {
            display: ${customization.showQrCode ? 'block' : 'none'};
            text-align: center;
            margin: 20px 0;
          }
          
          .qr-code img {
            width: 100px;
            height: 100px;
          }
          
          @page {
            size: ${customization.paperSize} ${customization.orientation};
            margin: 0;
          }
          
          @media print {
            html, body {
              width: 210mm;
              height: 297mm;
            }
            
            .page {
              margin: 0;
              border: none;
              box-shadow: none;
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="paid-stamp">${order.status === 'paid' ? 'PAID' : ''}</div>
          
          <div class="header">
            <div class="logo-company">
              ${customization.showHeaderImage && customization.headerImageUrl ? 
                `<img src="${customization.headerImageUrl}" alt="Company Logo" style="height: 60px; margin-bottom: 10px;">` : ''}
              <div class="company-name">${companySettings.name}</div>
              <div class="company-details">
                ${companySettings.address}<br>
                Phone: ${companySettings.phone} | Email: ${companySettings.email}<br>
                Website: ${companySettings.website}<br>
                GSTIN: ${companySettings.gstin}
              </div>
            </div>
            
            <div class="invoice-title">
              <h1>INVOICE</h1>
              <div class="invoice-number">#${order.id}</div>
              <div class="invoice-date">Date: ${order.date}</div>
            </div>
          </div>
          
          <div class="invoice-info">
            <div class="client-details">
              <div class="section-title">Bill To</div>
              <p><strong>${order.customer}</strong></p>
              <p>Customer Address</p>
              <p>Phone: </p>
              <p>Email: </p>
              <p>GSTIN: </p>
            </div>
            
            <div class="invoice-details">
              <div class="section-title">Invoice Details</div>
              <p><strong>Order Number:</strong> ${order.orderId || order.id.replace("INV", "ORD")}</p>
              <p><strong>Order Date:</strong> ${order.date}</p>
              <p><strong>Payment Terms:</strong> 30 days</p>
              <p><strong>Due Date:</strong> ${new Date(new Date(order.date).getTime() + 30*24*60*60*1000).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span style="color: ${order.status === 'paid' ? 'var(--success-color)' : 'var(--primary-color)'};">${order.status.toUpperCase()}</span></p>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th class="desc">Description</th>
                <th class="qty">Qty</th>
                <th class="price">Unit Price</th>
                <th class="tax">GST</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, index) => `
                <tr>
                  <td class="desc">${item.name}</td>
                  <td class="qty">${item.qty}</td>
                  <td class="price">₹${item.unitPrice.toFixed(2)}</td>
                  <td class="tax">${gstRate}%</td>
                  <td class="amount">₹${item.totalPrice.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <div class="totals">
              <table>
                <tr>
                  <td>Subtotal:</td>
                  <td>₹${taxableValue.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>GST (${gstRate}%):</td>
                  <td>₹${gstAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Shipping:</td>
                  <td>₹0.00</td>
                </tr>
                <tr class="grand-total">
                  <td>Total:</td>
                  <td>${order.amount}</td>
                </tr>
              </table>
            </div>
          </div>
          
          <div class="amount-in-words">
            <strong>Amount in words:</strong> ${totalInWords}
          </div>
          
          ${customization.showQrCode ? `
          <div class="qr-code">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAABQklEQVR4nO3WsU3EQBRF0TeKs5XQLVAKtbBdEFMCORnZEQVs/gl8zrHky7clr73Stm3D25zzuPpa1xhj3ddj7QGwn0AoAqEIhCIQikAoAqEIhCIQikAoAqEIhCIQikAoAqE" alt="QR Code" />
          </div>
          ` : ''}
          
          <div class="footer-text">
            ${customization.footerText}
          </div>
        </div>
      </body>
    </html>
  `;
};

// Function to export orders to Excel
export const exportOrdersToExcel = (orders: any[]) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Convert orders data to worksheet format
  const wsData = orders.map(order => ({
    'Invoice ID': order.id,
    'Order ID': order.orderId,
    'Customer': order.customer,
    'Date': order.date,
    'Amount': order.amount.replace('₹', ''),
    'Status': order.status
  }));
  
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(wsData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `Invoices_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

// Function to export attendance to Excel
export const exportAttendanceToExcel = (attendance: any[]) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Convert attendance data to worksheet format
  const wsData = attendance.map(record => ({
    'Employee ID': record.id,
    'Employee Name': record.name,
    'Date': record.date,
    'Check In': record.checkIn,
    'Check Out': record.checkOut,
    'Total Hours': record.totalHours,
    'Status': record.status
  }));
  
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(wsData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `Attendance_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
