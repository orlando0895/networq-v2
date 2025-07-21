// VCF (vCard) file generation utility
export interface ContactData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  linkedin?: string;
  facebook?: string;
  whatsapp?: string;
  websites?: string[];
  notes?: string;
}

export const generateVCF = (contact: ContactData): string => {
  const lines: string[] = [];
  
  // vCard header
  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');
  
  // Name (formatted as: Last;First)
  const nameParts = contact.name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  lines.push(`FN:${contact.name}`);
  lines.push(`N:${lastName};${firstName};;;`);
  
  // Email
  if (contact.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${contact.email}`);
  }
  
  // Phone
  if (contact.phone) {
    lines.push(`TEL;TYPE=CELL:${contact.phone}`);
  }
  
  // Organization
  if (contact.company) {
    lines.push(`ORG:${contact.company}`);
  }
  
  // Title/Industry
  if (contact.industry) {
    lines.push(`TITLE:${contact.industry}`);
  }
  
  // URLs/Websites
  if (contact.websites && contact.websites.length > 0) {
    contact.websites.forEach(website => {
      if (website) {
        lines.push(`URL:${website}`);
      }
    });
  }
  
  // Social media links
  if (contact.linkedin) {
    lines.push(`URL;TYPE=LinkedIn:${contact.linkedin}`);
  }
  
  if (contact.facebook) {
    lines.push(`URL;TYPE=Facebook:${contact.facebook}`);
  }
  
  if (contact.whatsapp) {
    lines.push(`URL;TYPE=WhatsApp:${contact.whatsapp}`);
  }
  
  // Notes
  if (contact.notes) {
    lines.push(`NOTE:${contact.notes}`);
  }
  
  // vCard footer
  lines.push('END:VCARD');
  
  return lines.join('\n');
};

export const downloadVCF = (contact: ContactData): void => {
  const vcfContent = generateVCF(contact);
  const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${contact.name.replace(/[^a-zA-Z0-9]/g, '_')}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};