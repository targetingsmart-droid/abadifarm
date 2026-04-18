import { motion } from "framer-motion";
import { Truck, Scissors, Package, Flame } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Gratis Pengiriman",
    description: "Pengiriman gratis ke seluruh area layanan kami",
  },
  {
    icon: Scissors,
    title: "Gratis Pemotongan",
    description: "Pemotongan sesuai syariat Islam oleh ahlinya",
  },
  {
    icon: Package,
    title: "Gratis Pengemasan",
    description: "Dikemas rapi dan higienis siap dibagikan",
  },
  {
    icon: Flame,
    title: "Gratis Pemasakan",
    description: "Dimasak oleh chef berpengalaman dengan resep pilihan",
  },
];

const container = {
  animate: {
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturesSection() {
  return (
    <section id="fasilitas" className="py-20 lg:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary-200" />
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-text-primary text-center">
            Fasilitas Gratis
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary-200" />
        </div>

        <motion.div
          variants={container}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="text-center group"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                <feature.icon
                  size={28}
                  className="text-primary group-hover:text-white transition-colors duration-300"
                />
              </div>
              <h3 className="font-serif text-lg font-bold text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
