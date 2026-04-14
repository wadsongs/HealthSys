"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Activity,
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardList,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Stethoscope,
  BedDouble,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { clearAuthSession } from "@/lib/auth-storage"

const menuItems = [
  {
    title: "Principal",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Pacientes", href: "/dashboard/pacientes", icon: Users },
      { label: "Novo Paciente", href: "/dashboard/pacientes/novo", icon: UserPlus },
    ],
  },
  {
    title: "Atendimento",
    items: [
      { label: "Triagens", href: "/dashboard/triagens", icon: ClipboardList },
      { label: "Consultas", href: "/dashboard/consultas", icon: Stethoscope },
      { label: "Internações", href: "/dashboard/internacoes", icon: BedDouble },
    ],
  },
  {
    title: "Gestão",
    items: [
      { label: "Agenda", href: "/dashboard/agenda", icon: Calendar },
      { label: "Relatórios", href: "/dashboard/relatorios", icon: FileText },
      { label: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
    ],
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sidebar-primary">
              <Activity className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-semibold text-sidebar-foreground">HealthSys</span>
                <span className="text-xs text-sidebar-foreground/60">Gestão Hospitalar</span>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Fechar menu"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-6">
            {menuItems.map((group) => (
              <div key={group.title}>
                {!isCollapsed && (
                  <h3 className="px-3 mb-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
                    {group.title}
                  </h3>
                )}
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                          )}
                        >
                          <item.icon className={cn("h-5 w-5 shrink-0", isCollapsed && "mx-auto")} />
                          {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <Separator className="mb-3 bg-sidebar-border" />
          <Link
            href="/login"
            onClick={() => clearAuthSession()}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Sair</span>}
          </Link>
        </div>
      </aside>
    </>
  )
}
