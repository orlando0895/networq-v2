import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Contact account status utilities
export function contactHasAccount(addedVia: string | null): boolean {
  const accountMethods = ['share_code', 'qr_code', 'mutual_contact'];
  return addedVia ? accountMethods.includes(addedVia) : false;
}

export function contactWithoutAccount(addedVia: string | null): boolean {
  const manualMethods = ['manual', 'business_card'];
  return addedVia ? manualMethods.includes(addedVia) : true;
}
