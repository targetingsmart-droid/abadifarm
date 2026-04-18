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

export default function LiveGoatsList() {
  const { toast } = useToast();
  const [goats, setGoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGoats = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("live_goats")
      .select("*")
      .order("goat_number");
    if (error) {
      toast({ title: "Gagal memuat data: " + error.message, variant: "destructive" });
    } else {
      setGoats(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchGoats();
  }, [fetchGoats]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.image_url) {
        const path = getStoragePathFromUrl(deleteTarget.image_url);
        if (path) await supabase.storage.from("goat-images").remove([path]);
      }
      const { error } = await supabase
        .from("live_goats")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;
      toast({ title: "Data berhasil dihapus" });
      setDeleteTarget(null);
      fetchGoats();
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
            Kambing Hidup
          </h1>
          <Link href="/admin/live-goats/new">
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
        ) : goats.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border">
            <p className="text-text-secondary mb-4">
              Belum ada data. Tambahkan kambing pertama!
            </p>
            <Link href="/admin/live-goats/new">
              <Button className="bg-primary hover:bg-primary-600 text-white">
                <Plus size={16} className="mr-1.5" />
                Tambah Kambing
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Gambar</TableHead>
                  <TableHead>No.</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Berat</TableHead>
                  <TableHead>Tinggi</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goats.map((goat) => (
                  <TableRow key={goat.id} className="hover:bg-primary-50/50">
                    <TableCell>
                      {goat.image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={goat.image_url}
                          alt={`Tipe ${goat.type}`}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center text-primary-300 text-xs">
                          N/A
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {goat.goat_number ? `#${goat.goat_number}` : "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {goat.type}
                    </TableCell>
                    <TableCell>{goat.weight_range}</TableCell>
                    <TableCell>{goat.height || "-"}</TableCell>
                    <TableCell>{formatPrice(goat.price)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={goat.is_active ? "default" : "secondary"}
                        className={
                          goat.is_active
                            ? "bg-green-100 text-green-700 border-0"
                            : "bg-gray-100 text-gray-500 border-0"
                        }
                      >
                        {goat.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/live-goats/edit/${goat.id}`}>
                          <Button variant="ghost" size="icon">
                            <Pencil size={16} className="text-primary" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(goat)}
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
              <DialogTitle>Hapus Kambing</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus Kambing Tipe{" "}
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
