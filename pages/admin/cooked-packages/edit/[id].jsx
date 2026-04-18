import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AdminNav from "@/components/admin/AdminNav";
import CookedPackageForm from "@/components/admin/CookedPackageForm";
import { Loader2 } from "lucide-react";

export default function EditCookedPackage() {
  const router = useRouter();
  const { id } = router.query;
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!router.isReady || !id) return;
    const fetchPackage = async () => {
      const { data, error } = await supabase
        .from("cooked_packages")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        setNotFound(true);
      } else {
        setPkg(data);
      }
      setLoading(false);
    };
    fetchPackage();
  }, [router.isReady, id]);

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <AdminNav />
        <div className="text-center py-20">
          <p className="text-text-secondary text-lg">Data tidak ditemukan</p>
          <Link
            href="/admin/cooked-packages"
            className="text-primary hover:underline mt-4 inline-block"
          >
            Kembali ke daftar
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
          <Link href="/admin" className="hover:text-primary">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/admin/cooked-packages" className="hover:text-primary">
            Paket Masak
          </Link>
          <span>/</span>
          <span className="text-text-primary">Edit Tipe {pkg.type}</span>
        </div>

        <h1 className="font-serif text-2xl font-bold text-text-primary mb-6">
          Edit Paket Masak Tipe {pkg.type}
        </h1>

        <div className="bg-white rounded-xl border p-6">
          <CookedPackageForm
            key={pkg.id}
            initialData={pkg}
            onSuccess={() => router.push("/admin/cooked-packages")}
          />
        </div>
      </div>
    </>
  );
}
