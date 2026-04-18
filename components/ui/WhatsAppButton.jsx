import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";

export default function WhatsAppButton({ message }) {
  return (
    <a
      href={getWhatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg hover:shadow-green-500/25 transition-all active:scale-95"
    >
      <MessageCircle size={18} />
      <span>Pesan via WhatsApp</span>
    </a>
  );
}
