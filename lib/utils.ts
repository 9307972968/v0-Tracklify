import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const d = new Date(date)
  return d.toLocaleString()
}

export function truncate(str: string, length: number) {
  return str.length > length ? str.substring(0, length) + "..." : str
}
