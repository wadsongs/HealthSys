"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Activity, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cadastrarUsuario } from "@/lib/api/auth"
import type { Perfil } from "@/lib/api/types"

const CARGOS = [
  { value: "ADMINISTRADOR", label: "Administrador" },
  { value: "MEDICO", label: "Médico(a)" },
  { value: "ENFERMEIRO", label: "Enfermeiro(a)" },
  { value: "RECEPCIONISTA", label: "Recepcionista" },
]

export default function CadastroPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    perfil: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validações
    if (!formData.nome || !formData.email || !formData.senha || !formData.confirmarSenha || !formData.perfil) {
      setError("Por favor, preencha todos os campos obrigatórios.")
      setIsLoading(false)
      return
    }

    if (!formData.email.includes("@")) {
      setError("Por favor, insira um e-mail válido.")
      setIsLoading(false)
      return
    }

    if (formData.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      setIsLoading(false)
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem.")
      setIsLoading(false)
      return
    }

    try {
      await cadastrarUsuario({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        perfil: formData.perfil as Perfil,
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao cadastrar usuário.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-border/50 shadow-lg">
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Cadastro Enviado!</h2>
            <p className="text-muted-foreground mb-6">
              Sua solicitação de acesso foi enviada para análise. Você receberá um e-mail quando for aprovada.
            </p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary mb-4">
            <Activity className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">HealthSys</h1>
          <p className="text-muted-foreground text-sm">Sistema de Gestão Hospitalar</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">Solicitar Acesso</CardTitle>
            <CardDescription className="text-center">
              Preencha o formulário para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="João da Silva"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="h-11"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail Corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@hospital.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="perfil">Cargo / Perfil</Label>
                <Select
                  value={formData.perfil}
                  onValueChange={(value) => setFormData({ ...formData, perfil: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione seu cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARGOS.map((perfil) => (
                      <SelectItem key={perfil.value} value={perfil.value}>
                        {perfil.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="h-11 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Digite a senha novamente"
                    value={formData.confirmarSenha}
                    onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                    className="h-11 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Solicitar Acesso"
                )}
              </Button>
            </form>

            <div className="mt-6">
              <Link
                href="/login"
                className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
