import { useRouter } from "next/router";
import AdminNav from "@/components/admin/AdminNav";
import LiveGoatForm from "@/components/admin/LiveGoatForm";
import Link from "next/link";

export default function NewLiveGoat() {
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
          <Link href="/admin/live-goats" className="hover:text-primary">
            Kambing Hidup
          </Link>
          <span>/</span>
          <span className="text-text-primary">Tambah Baru</span>
        </div>

        <h1 className="font-serif text-2xl font-bold text-text-primary mb-6">
          Tambah Kambing Hidup Baru
        </h1>

        <div className="bg-white rounded-xl border p-6">
          <LiveGoatForm
            onSuccess={() => router.push("/admin/live-goats")}
          />
        </div>
      </div>
    </>
  );
}
