import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(number) {
  if (!number && number !== 0) return "Rp 0";
  return `Rp ${number.toLocaleString("id-ID")}`;
}

export function getWhatsAppUrl(message) {
  const numbers = [
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_1,
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_2,
  ].filter(Boolean);

  const number = numbers[Math.floor(Math.random() * numbers.length)] || "6281326263563";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function getStoragePathFromUrl(url) {
  if (!url) return null;
  const match = url.match(/\/storage\/v1\/object\/public\/goat-images\/(.+)/);
  return match ? match[1] : null;
}

export function generateImageFileName(originalName) {
  const ext = originalName.split(".").pop();
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return `${id}-${Date.now()}.${ext}`;
}
