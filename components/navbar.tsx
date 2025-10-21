"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-primary-foreground">
              <Building2 className="size-5" />
            </div>
            <span className="text-xl font-semibold">CRM Sistema</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant={pathname === "/" ? "default" : "ghost"}>Gestión de Clientes</Button>
            </Link>
            <Link href="/carga">
              <Button variant={pathname === "/carga" ? "default" : "ghost"}>CARGA</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
