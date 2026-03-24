import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const FIRST_FESTIVAL_YEAR = 2021;

export function getYears(): string[] {
  const nextYear = new Date().getFullYear() + 1;
  const years: string[] = [];
  for (let y = nextYear; y >= FIRST_FESTIVAL_YEAR; y--) {
    years.push(y.toString());
  }
  return years;
}
