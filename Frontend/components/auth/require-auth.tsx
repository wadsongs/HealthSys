"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { getToken } from "@/lib/auth-storage"

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ok, setOk] = useState<boolean | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace("/login")
      setOk(false)
      return
    }
    setOk(true)
  }, [router])

  if (ok !== true) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">Verificando sessão...</p>
      </div>
    )
  }

  return <>{children}</>
}
