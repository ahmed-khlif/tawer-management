"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  Building2Icon,
  PaletteIcon,
  FileTextIcon,
  UsersIcon,
  UserIcon,
  CreditCardIcon,
  BellIcon,
  ShieldIcon,
  LucideIcon,
  Settings
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type NavItem = {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
};

const iconMap: Record<string, LucideIcon> = {
  Building2Icon,
  PaletteIcon,
  FileTextIcon,
  UsersIcon,
  UserIcon,
  CreditCardIcon,
  BellIcon,
  ShieldIcon,
  Settings
};

interface SidebarNavProps {
  navItems: NavItem[];
}

export function SidebarNav({ navItems }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <Card className="border-border/70 bg-card/95 py-0 shadow-sm">
      <CardContent className="p-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon ? iconMap[item.icon] : null;
            const isActive = pathname.endsWith(item.href);
            return (
              <Button
                key={item.href}
                variant="ghost"
                disabled={item.disabled}
                className={cn(
                  "justify-start gap-3 rounded-xl px-4 py-6 text-left text-base hover:bg-muted/70",
                  isActive
                    ? "bg-muted text-foreground shadow-sm hover:bg-muted"
                    : "text-foreground/90",
                  item.disabled ? "pointer-events-none cursor-not-allowed opacity-50" : ""
                )}
                asChild={!item.disabled}>
                {item.disabled ? (
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="size-5" />}
                    {item.title}
                  </div>
                ) : (
                  <Link href={item.href}>
                    {Icon && <Icon className="size-5" />}
                    {item.title}
                  </Link>
                )}
              </Button>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
}
