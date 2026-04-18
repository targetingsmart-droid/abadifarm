import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { generateImageFileName, getStoragePathFromUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Upload, Loader2, ImageIcon } from "lucide-react";

const cookedPackageSchema = z.object({
  type: z.enum(["Bronze", "Silver", "Gold", "Platinum", "Diamond"], {
    required_error: "Pilih tipe paket",
  }),
  weight_range: z.string().min(1, "Berat harus diisi"),
  price: z.coerce.number().positive("Harga harus lebih dari 0"),
  menu_items_str: z.string().min(1, "Menu harus diisi"),
  description: z.string().optional().default(""),
  is_active: z.boolean().default(true),
});

export default function CookedPackageForm({ initialData, onSuccess }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [imagePreview, setImagePreview] = useState(initialData?.image_url || "");

  const form = useForm({
    resolver: zodResolver(cookedPackageSchema),
    defaultValues: {
      type: initialData?.type || "",
      weight_range: initialData?.weight_range || "",
      price: initialData?.price || "",
      menu_items_str: initialData?.menu_items?.join(", ") || "",
      description: initialData?.description || "",
      is_active: initialData?.is_active ?? true,
    },
  });

  const menuItemsValue = form.watch("menu_items_str");
  const previewMenuItems = menuItemsValue
    ? menuItemsValue
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Format harus JPG, PNG, atau WebP",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Ukuran file maksimal 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileName = generateImageFileName(file.name);
      const { error } = await supabase.storage
        .from("goat-images")
        .upload(fileName, file);
      if (error) throw error;

      const { data } = supabase.storage
        .from("goat-images")
        .getPublicUrl(fileName);

      if (imageUrl) {
        const oldPath = getStoragePathFromUrl(imageUrl);
        if (oldPath) {
          await supabase.storage.from("goat-images").remove([oldPath]);
        }
      }

      setImageUrl(data.publicUrl);
      setImagePreview(data.publicUrl);
      toast({ title: "Gambar berhasil diupload" });
    } catch (err) {
      toast({
        title: "Gagal upload gambar: " + err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const menuItems = values.menu_items_str
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        type: values.type,
        weight_range: values.weight_range,
        price: values.price,
        description: values.description,
        is_active: values.is_active,
        menu_items: menuItems,
        image_url: imageUrl || null,
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from("cooked_packages")
          .update(payload)
          .eq("id", initialData.id);
        if (error) throw error;
        toast({ title: "Data berhasil diperbarui" });
      } else {
        const { error } = await supabase
          .from("cooked_packages")
          .insert(payload);
        if (error) throw error;
        toast({ title: "Data berhasil ditambahkan" });
      }

      onSuccess?.();
    } catch (err) {
      toast({
        title: "Terjadi kesalahan: " + err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipe Paket</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["Bronze", "Silver", "Gold", "Platinum", "Diamond"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Berat</FormLabel>
                <FormControl>
                  <Input placeholder="21-25 kg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga (Rp)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="3500000" {...field} />
                </FormControl>
                {field.value > 0 && (
                  <p className="text-xs text-text-secondary">
                    Rp {Number(field.value).toLocaleString("id-ID")}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 space-y-0 pt-8">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">Aktif (tampil di katalog)</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="menu_items_str"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Menu Masakan</FormLabel>
              <FormControl>
                <Input placeholder="Rendang, Gulai, Sate" {...field} />
              </FormControl>
              <p className="text-xs text-text-secondary">
                Pisahkan dengan koma
              </p>
              {previewMenuItems.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {previewMenuItems.map((item, i) => (
                    <span
                      key={i}
                      className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (opsional)</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Deskripsi paket masak..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Label className="mb-2 block">Gambar</Label>
          <div className="border-2 border-dashed border-primary-200 rounded-xl p-6 text-center hover:border-primary transition-colors">
            {imagePreview ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-40 h-32 object-cover rounded-lg mx-auto"
                />
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  Ganti gambar
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            ) : (
              <label className="cursor-pointer space-y-2 block">
                {uploading ? (
                  <Loader2
                    size={32}
                    className="animate-spin mx-auto text-primary"
                  />
                ) : (
                  <ImageIcon size={32} className="mx-auto text-primary-300" />
                )}
                <p className="text-sm text-text-secondary">
                  Klik untuk upload gambar (JPG, PNG, WebP, maks 5MB)
                </p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting || uploading}
          className="bg-primary hover:bg-primary-600 text-white"
        >
          {submitting && <Loader2 size={16} className="animate-spin mr-2" />}
          {initialData ? "Simpan Perubahan" : "Tambah Paket"}
        </Button>
      </form>
    </Form>
  );
}
