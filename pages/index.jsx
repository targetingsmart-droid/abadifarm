import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { staticLiveGoats } from "@/lib/staticGoats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import GoatCard from "@/components/ui/GoatCard";
import CookedCard from "@/components/ui/CookedCard";
import FeaturesSection from "@/components/ui/FeaturesSection";
import { Beef, ChefHat, ArrowDown, ShoppingBag } from "lucide-react";

const TYPES = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];

const heroImages = [
  "/images/slide-banner.svg",
  "/images/slide-tiers.svg",
  "/images/slide-goat.svg",
];

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const [liveGoats, setLiveGoats] = useState([]);
  const [cookedPackages, setCookedPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveFilter, setLiveFilter] = useState("Semua");
  const [cookedFilter, setCookedFilter] = useState("Semua");
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [goatsRes, packagesRes] = await Promise.all([
        supabase.from("live_goats").select("*").eq("is_active", true).order("type"),
        supabase.from("cooked_packages").select("*").eq("is_active", true).order("type"),
      ]);
      if (goatsRes.error) throw goatsRes.error;
      if (packagesRes.error) throw packagesRes.error;
      const goatsData = goatsRes.data || [];
      const packagesData = packagesRes.data || [];
      // Use static data as fallback if Supabase returns empty
      setLiveGoats(goatsData.length > 0 ? goatsData : staticLiveGoats);
      setCookedPackages(packagesData);
    } catch (err) {
      // Fallback to static data when Supabase is unavailable
      setLiveGoats(staticLiveGoats);
      setCookedPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredLiveGoats = liveFilter === "Semua" ? liveGoats : liveGoats.filter((g) => g.type === liveFilter);
  const filteredCookedPackages = cookedFilter === "Semua" ? cookedPackages : cookedPackages.filter((p) => p.type === cookedFilter);

  const SkeletonCard = () => (
    <div className="rounded-xl border border-primary-100/50 overflow-hidden">
      <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-8 bg-gray-200 rounded animate-pulse w-2/3" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );

  const TypeFilter = ({ value, onChange }) => (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
      {TYPES.map((type) => (
        <button
          key={type}
          onClick={() => onChange(value === type ? "Semua" : type)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
            value === type
              ? "bg-primary text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary"
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Image Carousel - Landscape strip */}
      <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={heroImages[currentSlide]}
            alt="ABADI FARM"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Slide indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentSlide ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Bottom gradient fade into green */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary-900 to-transparent" />
      </div>

      {/* Hero Text Section - Green gradient background */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 py-12 sm:py-16">
        <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="ABADI FARM Logo" className="h-36 w-36 sm:h-44 sm:w-44 rounded-full object-contain bg-black shadow-2xl border-4 border-white/30" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4"
          >
            ABADI FARM
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base sm:text-lg text-primary-100 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Pilihan terbaik untuk ibadah kurban Anda. Kualitas premium dengan harga terjangkau.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <a href="#katalog">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary-500 text-text-primary font-semibold px-8 py-5 rounded-xl shadow-lg shadow-secondary/30 hover:shadow-xl transition-all active:scale-95"
              >
                Lihat Katalog
                <ArrowDown size={18} className="ml-2" />
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-6"
          >
            {[
              { label: "500+ Terjual", icon: ShoppingBag },
              { label: "100% Halal", icon: Beef },
              { label: "Gratis Ongkir", icon: ChefHat },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs sm:text-sm"
              >
                <stat.icon size={14} />
                <span>{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Wave divider */}
      <svg className="w-full -mt-1 text-background" viewBox="0 0 1440 60" fill="currentColor" preserveAspectRatio="none">
        <path d="M0,0 Q360,60 720,30 Q1080,0 1440,40 L1440,60 L0,60 Z" />
      </svg>

      {/* Catalog Section */}
      <section id="katalog" className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-text-primary mb-4">Pilih Kambing Kurban Anda</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">Tersedia berbagai pilihan kambing hidup dan paket masak siap saji.</p>
          </motion.div>

          <Tabs defaultValue="live" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-primary-50 p-1 h-auto">
              <TabsTrigger value="live" className="flex items-center gap-2 py-3 text-primary font-semibold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-md">
                <Beef size={16} /> Qurban Hidup
              </TabsTrigger>
              <TabsTrigger value="cooked" className="flex items-center gap-2 py-3 text-primary font-semibold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-md">
                <ChefHat size={16} /> Qurban Masak
              </TabsTrigger>
            </TabsList>

            <TabsContent value="live">
              <TypeFilter value={liveFilter} onChange={setLiveFilter} />
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
              ) : error ? (
                <div className="text-center py-12"><p className="text-red-500 mb-4">{error}</p><Button onClick={fetchAll} variant="outline">Coba Lagi</Button></div>
              ) : filteredLiveGoats.length === 0 ? (
                <div className="text-center py-16"><Beef size={48} className="mx-auto text-primary-200 mb-4" /><p className="text-text-secondary text-lg">{liveFilter !== "Semua" ? `Tidak ada kambing Tipe ${liveFilter}` : "Belum ada kambing tersedia"}</p>{liveFilter !== "Semua" && <button onClick={() => setLiveFilter("Semua")} className="mt-3 text-primary hover:underline text-sm">Tampilkan semua</button>}</div>
              ) : (
                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">{filteredLiveGoats.map((goat) => <GoatCard key={goat.id} goat={goat} />)}</motion.div>
              )}
            </TabsContent>

            <TabsContent value="cooked">
              <TypeFilter value={cookedFilter} onChange={setCookedFilter} />
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
              ) : error ? (
                <div className="text-center py-12"><p className="text-red-500 mb-4">{error}</p><Button onClick={fetchAll} variant="outline">Coba Lagi</Button></div>
              ) : filteredCookedPackages.length === 0 ? (
                <div className="text-center py-16"><ChefHat size={48} className="mx-auto text-secondary-200 mb-4" /><p className="text-text-secondary text-lg">{cookedFilter !== "Semua" ? `Tidak ada paket Tipe ${cookedFilter}` : "Belum ada paket tersedia"}</p>{cookedFilter !== "Semua" && <button onClick={() => setCookedFilter("Semua")} className="mt-3 text-primary hover:underline text-sm">Tampilkan semua</button>}</div>
              ) : (
                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">{filteredCookedPackages.map((pkg) => <CookedCard key={pkg.id} pkg={pkg} />)}</motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <svg className="w-full -mb-1 text-surface" viewBox="0 0 1440 60" fill="currentColor" preserveAspectRatio="none">
        <path d="M0,40 Q360,0 720,30 Q1080,60 1440,20 L1440,60 L0,60 Z" />
      </svg>

      <FeaturesSection />
    </>
  );
}
