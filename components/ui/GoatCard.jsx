import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, Tag, Ruler } from "lucide-react";
import { motion } from "framer-motion";
import WhatsAppButton from "./WhatsAppButton";

export default function GoatCard({ goat }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden rounded-xl border border-primary-100/50 hover:-translate-y-2 hover:shadow-card-hover transition-all duration-300">
        <div className="aspect-[4/3] relative overflow-hidden">
          {goat.image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={goat.image_url}
              alt={`Kambing Tipe ${goat.type}`}
              loading="lazy"
              width={400}
              height={300}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-primary-50 flex items-center justify-center">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                className="text-primary-200"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z"
                  fill="currentColor"
                />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          <Badge className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-white border-0">
            {goat.type}
          </Badge>
          {goat.goat_number && (
            <Badge className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white border-0 font-mono">
              #{goat.goat_number}
            </Badge>
          )}
        </div>
        <CardContent className="p-3 sm:p-4 flex flex-col">
          <h3 className="font-serif text-base sm:text-lg font-bold text-text-primary leading-tight">
            Kambing {goat.type} {goat.goat_number ? `#${goat.goat_number}` : ""}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs sm:text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <Scale size={14} />
              {goat.weight_range}
            </span>
            {goat.height && (
              <span className="flex items-center gap-1">
                <Ruler size={14} />
                {goat.height}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5 mt-2 mb-3">
            <Tag size={14} className="text-secondary flex-shrink-0 relative top-0.5" />
            <span className="text-lg sm:text-2xl font-bold text-secondary leading-tight break-all">
              Rp {goat.price?.toLocaleString("id-ID")}
            </span>
          </div>
          {goat.description && (
            <p className="text-xs sm:text-sm text-text-secondary mb-3 line-clamp-2">
              {goat.description}
            </p>
          )}
          <div className="mt-auto">
            <WhatsAppButton
              message={`Halo, saya tertarik Kambing Hidup Tipe ${goat.type}${goat.goat_number ? ` (No. ${goat.goat_number})` : ""} (${goat.weight_range}) harga Rp ${goat.price?.toLocaleString("id-ID")}. Apakah masih tersedia?`}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
