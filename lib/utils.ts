import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina classes CSS com clsx e tailwind-merge para evitar conflitos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um número para exibição em um formato amigável (ex: 1.2k, 3.5M)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

/**
 * Formata uma duração em segundos para o formato MM:SS ou HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Trunca uma string para um determinado comprimento
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

/**
 * Converte um objeto de erro para uma string amigável
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}