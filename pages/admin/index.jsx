import { useState, useEffect } from "react";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Beef, ChefHat, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const [liveCount, setLiveCount] = useState(0);
  const [cookedCount, setCookedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      const [liveRes, cookedRes] = await Promise.all([
        supabase
          .from("live_goats")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("cooked_packages")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
      ]);
      setLiveCount(liveRes.count || 0);
      setCookedCount(cookedRes.count || 0);
      setLoading(false);
    };
    fetchCounts();
  }, []);

  const AnimatedCount = ({ value, isLoading }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      if (isLoading) return;
      let start = 0;
      const duration = 1000;
      const step = Math.max(1, Math.floor(value / (duration / 16)));
      const timer = setInterval(() => {
        start += step;
        if (start >= value) {
          setDisplay(value);
          clearInterval(timer);
        } else {
          setDisplay(start);
        }
      }, 16);
      return () => clearInterval(timer);
    }, [value, isLoading]);
    return <span>{display}</span>;
  };

  return (
    <>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h1 className="font-serif text-3xl font-bold text-text-primary mb-8">
          Dashboard Admin
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">
                    Kambing Hidup Aktif
                  </p>
                  <p className="text-4xl font-bold text-text-primary">
                    {loading ? (
                      <span className="inline-block w-12 h-10 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      <AnimatedCount value={liveCount} isLoading={loading} />
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                  <Beef size={24} className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-secondary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">
                    Paket Masak Aktif
                  </p>
                  <p className="text-4xl font-bold text-text-primary">
                    {loading ? (
                      <span className="inline-block w-12 h-10 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      <AnimatedCount value={cookedCount} isLoading={loading} />
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary-50 flex items-center justify-center">
                  <ChefHat size={24} className="text-secondary-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/live-goats">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-text-primary mb-1">
                    Kelola Kambing Hidup
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Tambah, edit, dan hapus data kambing hidup
                  </p>
                </div>
                <ArrowRight
                  size={20}
                  className="text-primary group-hover:translate-x-1 transition-transform"
                />
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/cooked-packages">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-text-primary mb-1">
                    Kelola Paket Masak
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Tambah, edit, dan hapus data paket masak
                  </p>
                </div>
                <ArrowRight
                  size={20}
                  className="text-primary group-hover:translate-x-1 transition-transform"
                />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </>
  );
}
