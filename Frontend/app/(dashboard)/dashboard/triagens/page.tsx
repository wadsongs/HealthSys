"use client"

import { useMemo, useState } from "react"
import {
  ClipboardList,
  Clock3,
  PlusCircle,
  Search,
  Siren,
  UserRound,
  Timer,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

type Prioridade = "Vermelho" | "Laranja" | "Amarelo" | "Verde" | "Azul"

interface Triagem {
  id: number
  paciente: string
  queixa: string
  prioridade: Prioridade
  bpm: string
  temperatura: string
  satO2: string
  horarioChegada: string
  status: "Aguardando" | "Em atendimento"
}

const prioridadeClasses: Record<Prioridade, string> = {
  Vermelho: "bg-red-500/15 text-red-700 border-red-500/30",
  Laranja: "bg-orange-500/15 text-orange-700 border-orange-500/30",
  Amarelo: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  Verde: "bg-green-500/15 text-green-700 border-green-500/30",
  Azul: "bg-blue-500/15 text-blue-700 border-blue-500/30",
}

const seedTriagens: Triagem[] = [
  {
    id: 1,
    paciente: "Marcos André Silva",
    queixa: "Dor torácica intensa",
    prioridade: "Vermelho",
    bpm: "122",
    temperatura: "37.8",
    satO2: "91",
    horarioChegada: "14:08",
    status: "Em atendimento",
  },
  {
    id: 2,
    paciente: "Luciana Costa",
    queixa: "Dispneia e tontura",
    prioridade: "Laranja",
    bpm: "108",
    temperatura: "37.2",
    satO2: "93",
    horarioChegada: "14:17",
    status: "Aguardando",
  },
  {
    id: 3,
    paciente: "Rafael Moreira",
    queixa: "Febre e dor no corpo",
    prioridade: "Amarelo",
    bpm: "96",
    temperatura: "38.9",
    satO2: "97",
    horarioChegada: "14:24",
    status: "Aguardando",
  },
]

export default function TriagensPage() {
  const [triagens, setTriagens] = useState<Triagem[]>(seedTriagens)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    paciente: "",
    queixa: "",
    prioridade: "Verde" as Prioridade,
    bpm: "",
    temperatura: "",
    satO2: "",
  })

  const filtradas = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return triagens
    return triagens.filter(
      (triagem) =>
        triagem.paciente.toLowerCase().includes(query) ||
        triagem.queixa.toLowerCase().includes(query) ||
        triagem.prioridade.toLowerCase().includes(query)
    )
  }, [searchTerm, triagens])

  const aguardando = useMemo(
    () => triagens.filter((triagem) => triagem.status === "Aguardando").length,
    [triagens]
  )

  const criticos = useMemo(
    () =>
      triagens.filter((triagem) => triagem.prioridade === "Vermelho" || triagem.prioridade === "Laranja")
        .length,
    [triagens]
  )

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      !formData.paciente.trim() ||
      !formData.queixa.trim() ||
      !formData.bpm.trim() ||
      !formData.temperatura.trim() ||
      !formData.satO2.trim()
    ) {
      toast.error("Preencha todos os campos obrigatórios da triagem.")
      return
    }

    const now = new Date()
    const horarioChegada = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const novaTriagem: Triagem = {
      id: Date.now(),
      paciente: formData.paciente.trim(),
      queixa: formData.queixa.trim(),
      prioridade: formData.prioridade,
      bpm: formData.bpm.trim(),
      temperatura: formData.temperatura.trim(),
      satO2: formData.satO2.trim(),
      horarioChegada,
      status: "Aguardando",
    }

    setTriagens((atual) => [novaTriagem, ...atual])
    setFormData({
      paciente: "",
      queixa: "",
      prioridade: "Verde",
      bpm: "",
      temperatura: "",
      satO2: "",
    })

    toast.success("Triagem registrada com sucesso.")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Triagem</h1>
          <p className="text-muted-foreground">
            Classificação de risco e controle da fila de atendimento.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit gap-2">
          <ClipboardList className="h-4 w-4" />
          Protocolo de Manchester
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Na fila</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">{aguardando}</span>
            <Clock3 className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Casos críticos</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">{criticos}</span>
            <Siren className="h-5 w-5 text-destructive" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em atendimento</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {triagens.filter((triagem) => triagem.status === "Em atendimento").length}
            </span>
            <Timer className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total no turno</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">{triagens.length}</span>
            <UserRound className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle>Fila de triagem</CardTitle>
            <CardDescription>Pacientes aguardando classificação e encaminhamento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente, queixa ou prioridade..."
                className="pl-10"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead className="hidden lg:table-cell">Queixa</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead className="hidden sm:table-cell">Sinais Vitais</TableHead>
                    <TableHead>Chegada</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtradas.map((triagem) => (
                    <TableRow key={triagem.id}>
                      <TableCell className="font-medium">{triagem.paciente}</TableCell>
                      <TableCell className="hidden lg:table-cell">{triagem.queixa}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={prioridadeClasses[triagem.prioridade]}>
                          {triagem.prioridade}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        FC {triagem.bpm} bpm | Temp {triagem.temperatura} C | SpO2 {triagem.satO2}%
                      </TableCell>
                      <TableCell>{triagem.horarioChegada}</TableCell>
                      <TableCell>
                        <Badge variant={triagem.status === "Aguardando" ? "secondary" : "default"}>
                          {triagem.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filtradas.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum paciente encontrado para o filtro informado.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Nova triagem</CardTitle>
            <CardDescription>Registre rapidamente o paciente na fila.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paciente">Paciente</Label>
                <Input
                  id="paciente"
                  placeholder="Nome completo"
                  value={formData.paciente}
                  onChange={(event) => setFormData((prev) => ({ ...prev, paciente: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="queixa">Queixa principal</Label>
                <Textarea
                  id="queixa"
                  placeholder="Descreva a queixa em poucas palavras"
                  value={formData.queixa}
                  onChange={(event) => setFormData((prev) => ({ ...prev, queixa: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(value: Prioridade) => setFormData((prev) => ({ ...prev, prioridade: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vermelho">Vermelho - Emergente</SelectItem>
                    <SelectItem value="Laranja">Laranja - Muito urgente</SelectItem>
                    <SelectItem value="Amarelo">Amarelo - Urgente</SelectItem>
                    <SelectItem value="Verde">Verde - Pouco urgente</SelectItem>
                    <SelectItem value="Azul">Azul - Não urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="bpm">FC</Label>
                  <Input
                    id="bpm"
                    placeholder="bpm"
                    value={formData.bpm}
                    onChange={(event) => setFormData((prev) => ({ ...prev, bpm: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperatura">Temp.</Label>
                  <Input
                    id="temperatura"
                    placeholder="C"
                    value={formData.temperatura}
                    onChange={(event) => setFormData((prev) => ({ ...prev, temperatura: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="satO2">SpO2</Label>
                  <Input
                    id="satO2"
                    placeholder="%"
                    value={formData.satO2}
                    onChange={(event) => setFormData((prev) => ({ ...prev, satO2: event.target.value }))}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2">
                <PlusCircle className="h-4 w-4" />
                Adicionar à fila
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
