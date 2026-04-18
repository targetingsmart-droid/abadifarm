import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Playfair_Display, Inter } from "next/font/google";
import "@/styles/globals.css";
import Layout from "@/components/layout/Layout";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const isAdminRoute = router.pathname.startsWith("/admin");
  const isLoginPage = router.pathname === "/admin/login";

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
      setAuthLoading(false);
    };
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession && isAdminRoute && !isLoginPage) {
        router.push("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [isAdminRoute, isLoginPage, router]);

  useEffect(() => {
    if (authLoading) return;

    if (isAdminRoute && !isLoginPage && !session) {
      router.replace("/admin/login");
    }

    if (isLoginPage && session) {
      router.replace("/admin");
    }
  }, [session, authLoading, isAdminRoute, isLoginPage, router]);

  if (isAdminRoute && !isLoginPage && authLoading) {
    return (
      <div
        className={`${playfair.variable} ${inter.variable} font-sans min-h-screen flex items-center justify-center bg-background`}
      >
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  // Admin routes don't use the public Layout (Header/Footer)
  if (isAdminRoute) {
    return (
      <div className={`${playfair.variable} ${inter.variable} font-sans min-h-screen bg-background`}>
        <Component {...pageProps} />
        <Toaster />
      </div>
    );
  }

  return (
    <div className={`${playfair.variable} ${inter.variable} font-sans`}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Toaster />
    </div>
  );
}
