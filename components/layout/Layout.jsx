import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";
import { MessageCircle, ArrowUp } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";

export default function Layout({ children }) {
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isAdminRoute = router.pathname.startsWith("/admin");
  const isLoginPage = router.pathname === "/admin/login";

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoginPage) {
    return (
      <>
        <Head>
          <title>Login - ABADI FARM Admin</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        {children}
      </>
    );
  }

  return (
    <>
      <Head>
        <title>ABADI FARM - Kambing Kurban Premium</title>
        <meta
          name="description"
          content="ABADI FARM - Penyedia kambing kurban premium dengan kualitas terbaik. Melayani pemesanan untuk Idul Adha dan aqiqah."
        />
        <meta property="og:title" content="ABADI FARM - Kambing Kurban Premium" />
        <meta
          property="og:description"
          content="Pilihan kambing kurban terbaik dengan harga terjangkau. Gratis pengiriman, pemotongan, dan pemasakan."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://abadifarm.store" />
        <meta property="og:image" content="https://abadifarm.store/logo.jpg" />
        <link rel="canonical" href="https://abadifarm.store" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {isAdminRoute && (
          <>
            <meta
              httpEquiv="Cache-Control"
              content="no-cache, no-store, must-revalidate"
            />
            <meta httpEquiv="Pragma" content="no-cache" />
            <meta httpEquiv="Expires" content="0" />
          </>
        )}
      </Head>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>

      {!isAdminRoute && (
        <a
          href={getWhatsAppUrl("Halo, saya ingin bertanya tentang kambing kurban.")}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
          aria-label="Chat WhatsApp"
        >
          <span className="absolute inset-0 rounded-full bg-green-400 animate-pulse-ring" />
          <MessageCircle size={24} className="relative z-10" />
        </a>
      )}

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 left-6 z-50 bg-primary hover:bg-primary-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
}
