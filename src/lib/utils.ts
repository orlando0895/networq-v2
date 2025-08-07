import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper functions for clickable contact info
export function formatEmailLink(email: string): string {
  return `mailto:${email}`;
}

export function formatPhoneLink(phone: string): string {
  // Remove all non-digit characters except + at the beginning
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  return `tel:${cleanPhone}`;
}

export function formatEmailForDisplay(email: string): string {
  return email;
}

export function formatPhoneForDisplay(phone: string): string {
  return phone;
}
