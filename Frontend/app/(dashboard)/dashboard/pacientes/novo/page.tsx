"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  User,
  Phone,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { cadastrarPaciente } from "@/lib/api/pacientes"

export default function NovoPacientePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
    sexo: "",
    telefone: "",
    alergias: "",
  })

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .slice(0, 14)
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
    }
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15)
  }

  const formatDateForApi = (value: string) => {
    const [year, month, day] = value.split("-")
    return `${day}/${month}/${year}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validações básicas
    if (!formData.nome || !formData.cpf || !formData.dataNascimento || !formData.sexo || !formData.telefone) {
      setError("Por favor, preencha todos os campos obrigatórios marcados com *")
      setIsLoading(false)
      return
    }

    if (formData.cpf.replace(/\D/g, "").length !== 11) {
      setError("CPF inválido. Deve conter 11 dígitos.")
      setIsLoading(false)
      return
    }

    try {
      await cadastrarPaciente({
        nome: formData.nome,
        cpf: formData.cpf,
        dataNascimento: formatDateForApi(formData.dataNascimento),
        sexo: formData.sexo,
        telefone: formData.telefone,
        alergias: formData.alergias
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        vacinas: [],
      })

      toast.success("Paciente cadastrado com sucesso!", {
        description: `${formData.nome} foi adicionado ao sistema.`,
      })

      router.push("/dashboard/pacientes")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao cadastrar paciente.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/pacientes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Voltar</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cadastrar Novo Paciente</h1>
          <p className="text-muted-foreground">
            Preencha os dados do paciente. Campos com * são obrigatórios.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção: Dados Pessoais */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>
                  Informações de identificação do paciente
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  placeholder="Digite o nome completo do paciente"
                  value={formData.nome}
                  onChange={(e) => updateField("nome", e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => updateField("cpf", formatCPF(e.target.value))}
                  className="h-11"
                  maxLength={14}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => updateField("dataNascimento", e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Sexo *</Label>
                <RadioGroup
                  value={formData.sexo}
                  onValueChange={(value) => updateField("sexo", value)}
                  className="flex gap-4 h-11 items-center"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MASCULINO" id="masculino" />
                    <Label htmlFor="masculino" className="font-normal cursor-pointer">
                      Masculino
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FEMININO" id="feminino" />
                    <Label htmlFor="feminino" className="font-normal cursor-pointer">
                      Feminino
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="OUTRO" id="outro" />
                    <Label htmlFor="outro" className="font-normal cursor-pointer">
                      Outro
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção: Contato */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Informações de Contato</CardTitle>
                <CardDescription>Telefone para contato do paciente</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={(e) => updateField("telefone", formatPhone(e.target.value))}
                  className="h-11"
                  maxLength={15}
                />
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Seção: Histórico Básico */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Histórico Médico Básico</CardTitle>
                <CardDescription>
                  Alergias cadastradas para atendimento seguro
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="alergias">Alergias</Label>
                <Input
                  id="alergias"
                  placeholder="Ex: Penicilina, Dipirona (separe por vírgula)"
                  value={formData.alergias}
                  onChange={(e) => updateField("alergias", e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Link href="/dashboard/pacientes" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" className="w-full sm:w-auto gap-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Cadastrar Paciente
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
