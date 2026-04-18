import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { getStoragePathFromUrl, formatPrice } from "@/lib/utils";
import AdminNav from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

export default function CookedPackagesList() {
  const { toast } = useToast();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cooked_packages")
      .select("*")
      .order("type");
    if (error) {
      toast({ title: "Gagal memuat data: " + error.message, variant: "destructive" });
    } else {
      setPackages(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.image_url) {
        const path = getStoragePathFromUrl(deleteTarget.image_url);
        if (path) await supabase.storage.from("goat-images").remove([path]);
      }
      const { error } = await supabase
        .from("cooked_packages")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;
      toast({ title: "Data berhasil dihapus" });
      setDeleteTarget(null);
      fetchPackages();
    } catch (err) {
      toast({ title: "Gagal menghapus: " + err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl font-bold text-text-primary">
            Paket Masak
          </h1>
          <Link href="/admin/cooked-packages/new">
            <Button className="bg-primary hover:bg-primary-600 text-white">
              <Plus size={16} className="mr-1.5" />
              Tambah Baru
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 rounded animate-pulse"
              />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border">
            <p className="text-text-secondary mb-4">
              Belum ada data. Tambahkan paket masak pertama!
            </p>
            <Link href="/admin/cooked-packages/new">
              <Button className="bg-primary hover:bg-primary-600 text-white">
                <Plus size={16} className="mr-1.5" />
                Tambah Paket
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Gambar</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Berat</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Menu</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id} className="hover:bg-primary-50/50">
                    <TableCell>
                      {pkg.image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={pkg.image_url}
                          alt={`Tipe ${pkg.type}`}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-secondary-50 flex items-center justify-center text-secondary-300 text-xs">
                          N/A
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      Tipe {pkg.type}
                    </TableCell>
                    <TableCell>{pkg.weight_range}</TableCell>
                    <TableCell>{formatPrice(pkg.price)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {(pkg.menu_items || []).slice(0, 3).join(", ")}
                      {(pkg.menu_items || []).length > 3 && "..."}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={pkg.is_active ? "default" : "secondary"}
                        className={
                          pkg.is_active
                            ? "bg-green-100 text-green-700 border-0"
                            : "bg-gray-100 text-gray-500 border-0"
                        }
                      >
                        {pkg.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/cooked-packages/edit/${pkg.id}`}>
                          <Button variant="ghost" size="icon">
                            <Pencil size={16} className="text-primary" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(pkg)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Paket Masak</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus Paket Masak Tipe{" "}
                {deleteTarget?.type} ({deleteTarget?.weight_range})? Tindakan
                ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting && (
                  <Loader2 size={16} className="animate-spin mr-1.5" />
                )}
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
