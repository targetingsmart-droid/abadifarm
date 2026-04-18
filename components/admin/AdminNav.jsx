import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { LayoutDashboard, Beef, ChefHat, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/live-goats", label: "Kambing Hidup", icon: Beef },
  { href: "/admin/cooked-packages", label: "Paket Masak", icon: ChefHat },
];

export default function AdminNav() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Berhasil keluar" });
    router.push("/admin/login");
  };

  return (
    <nav className="bg-white border-b shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 overflow-x-auto">
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="font-serif text-lg font-bold text-primary mr-4 shrink-0"
            >
              ABADI FARM Admin
            </Link>

            {links.map((link) => {
              const isActive =
                router.pathname === link.href ||
                (link.href !== "/admin" &&
                  router.pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors shrink-0 ${
                    isActive
                      ? "text-primary bg-primary-50 border-b-2 border-primary"
                      : "text-text-secondary hover:text-primary hover:bg-primary-50/50"
                  }`}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700 hover:border-red-300 shrink-0"
          >
            <LogOut size={16} className="mr-1.5" />
            Keluar
          </Button>
        </div>
      </div>
    </nav>
  );
}
