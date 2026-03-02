import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birth = new Date(dateOfBirth)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function getPublicUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/setcard-media/${path}`
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    neu: 'Neu',
    abgelehnt: 'Abgelehnt',
    onhold: 'On Hold',
    pool: 'Pool'
  }
  return labels[status] || status
}

export function castPriorityLabel(priority: string | null): string {
  if (!priority) return 'Kein Cast'
  const labels: Record<string, string> = {
    A: 'A-Cast',
    B: 'B-Cast',
    C: 'C-Cast'
  }
  return labels[priority] || priority
}
