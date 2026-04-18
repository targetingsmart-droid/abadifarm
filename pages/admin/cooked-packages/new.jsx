import { useRouter } from "next/router";
import AdminNav from "@/components/admin/AdminNav";
import CookedPackageForm from "@/components/admin/CookedPackageForm";
import Link from "next/link";

export default function NewCookedPackage() {
  const router = useRouter();

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
          <span className="text-text-primary">Tambah Baru</span>
        </div>

        <h1 className="font-serif text-2xl font-bold text-text-primary mb-6">
          Tambah Paket Masak Baru
        </h1>

        <div className="bg-white rounded-xl border p-6">
          <CookedPackageForm
            onSuccess={() => router.push("/admin/cooked-packages")}
          />
        </div>
      </div>
    </>
  );
}
