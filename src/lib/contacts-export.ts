import { generateVCF } from "@/lib/vcf";
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

export const exportContactsToCSV = (contacts: Contact[]): void => {
  const headers = ['Name', 'Email', 'Phone', 'Company', 'Industry', 'Tier', 'Notes'];
  const csvContent = [
    headers.join(','),
    ...contacts.map(contact => [
      `"${contact.name || ''}"`,
      `"${contact.email || ''}"`,
      `"${contact.phone || ''}"`,
      `"${contact.company || ''}"`,
      `"${contact.industry || ''}"`,
      `"${contact.tier || ''}"`,
      `"${(contact.notes || '').replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `networq-contacts-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportContactsToVCF = (contacts: Contact[]): void => {
  const vcfContent = contacts
    .map(contact => generateVCF(contact))
    .join('\n\n');
  
  const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `networq-contacts-${new Date().toISOString().split('T')[0]}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};