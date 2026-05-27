"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import {
  ArrowLeft,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  ClipboardList,
  FlaskConical,
  Pill,
  AlertTriangle,
  ScrollText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buscarPacientePorId } from "@/lib/api/pacientes"
import {
  adicionarConsulta,
  adicionarExame,
  adicionarMedicamento,
  atualizarAlergias,
  buscarLogsAuditoria,
  buscarProntuario,
  criarProntuario,
} from "@/lib/api/prontuario"
import type { PacienteResponse, ProntuarioModel } from "@/lib/api/types"
import { getUserId } from "@/lib/auth-storage"
import { isApiError } from "@/lib/api/client"
import { toast } from "sonner"

function isNotFound(err: unknown): boolean {
  if (isApiError(err)) return err.status === 404
  return err instanceof Error && /\b404\b/.test(err.message)
}

function formatNowForApi(): string {
  return format(new Date(), "dd/MM/yyyy HH:mm")
}

export default function ProntuarioPacientePage() {
  const params = useParams()
  const idPaciente = Number(params.id)

  const [paciente, setPaciente] = useState<PacienteResponse | null>(null)
  const [prontuario, setProntuario] = useState<ProntuarioModel | null>(null)
  const [semProntuario, setSemProntuario] = useState(false)
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof buscarLogsAuditoria>>>([])
  const [loading, setLoading] = useState(true)
  const [criando, setCriando] = useState(false)
  const [tab, setTab] = useState("visao")

  const [userIdStr, setUserIdStr] = useState("")

  const [consulta, setConsulta] = useState({
    idMedico: "",
    tipoAtendimento: "CONSULTA",
    diagnostico: "",
    observacoes: "",
    dataHoraLocal: "",
  })
  const [exame, setExame] = useState({
    nome: "",
    idSolicitante: "",
    resultado: "",
    dataResultadoLocal: "",
  })
  const [medicamento, setMedicamento] = useState({
    nome: "",
    dosagem: "",
    frequencia: "",
    idPrescritor: "",
  })
  const [alergiasTexto, setAlergiasTexto] = useState("")
  const [submitting, setSubmitting] = useState<string | null>(null)

  const carregarProntuario = useCallback(async () => {
    if (!Number.isFinite(idPaciente)) return
    try {
      const p = await buscarProntuario(idPaciente)
      setProntuario(p)
      setSemProntuario(false)
      setAlergiasTexto((p.alergias ?? []).join("\n"))
    } catch (err) {
      if (isNotFound(err)) {
        setProntuario(null)
        setSemProntuario(true)
      } else {
        throw err
      }
    }
  }, [idPaciente])

  useEffect(() => {
    const u = getUserId()
    const s = u != null ? String(u) : ""
    setUserIdStr(s)
    setConsulta((c) => ({ ...c, idMedico: s }))
    setExame((e) => ({ ...e, idSolicitante: s }))
    setMedicamento((m) => ({ ...m, idPrescritor: s }))
  }, [])

  useEffect(() => {
    if (!Number.isFinite(idPaciente)) {
      setLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const pac = await buscarPacientePorId(idPaciente)
        if (cancelled) return
        setPaciente(pac)
        await carregarProntuario()
      } catch (err) {
        if (!cancelled) {
          toast.error("Erro ao carregar paciente", {
            description: err instanceof Error ? err.message : undefined,
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [idPaciente, carregarProntuario])

  const handleCriarProntuario = async () => {
    setCriando(true)
    try {
      const p = await criarProntuario(idPaciente)
      setProntuario(p)
      setSemProntuario(false)
      setAlergiasTexto((p.alergias ?? []).join("\n"))
      toast.success("Prontuário criado.")
    } catch (err) {
      toast.error("Não foi possível criar o prontuário", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setCriando(false)
    }
  }

  const refreshAfterMutation = async (p: ProntuarioModel) => {
    setProntuario(p)
    setAlergiasTexto((p.alergias ?? []).join("\n"))
  }

  const onAddConsulta = async (e: React.FormEvent) => {
    e.preventDefault()
    const idMed = Number(consulta.idMedico)
    if (!consulta.diagnostico.trim() || !Number.isFinite(idMed)) {
      toast.error("Preencha médico e diagnóstico.")
      return
    }
    setSubmitting("consulta")
    try {
      const body = {
        idMedico: idMed,
        tipoAtendimento: consulta.tipoAtendimento,
        diagnostico: consulta.diagnostico.trim(),
        observacoes: consulta.observacoes.trim() || undefined,
        dataHora: consulta.dataHoraLocal
          ? format(new Date(consulta.dataHoraLocal), "dd/MM/yyyy HH:mm")
          : formatNowForApi(),
      }
      const p = await adicionarConsulta(idPaciente, body)
      await refreshAfterMutation(p)
      setConsulta((c) => ({
        ...c,
        diagnostico: "",
        observacoes: "",
        dataHoraLocal: "",
      }))
      toast.success("Consulta registrada.")
    } catch (err) {
      toast.error("Erro ao registrar consulta", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setSubmitting(null)
    }
  }

  const onAddExame = async (e: React.FormEvent) => {
    e.preventDefault()
    const idSol = Number(exame.idSolicitante)
    if (!exame.nome.trim() || !Number.isFinite(idSol)) {
      toast.error("Preencha nome do exame e solicitante.")
      return
    }
    setSubmitting("exame")
    try {
      const body = {
        nome: exame.nome.trim(),
        idSolicitante: idSol,
        resultado: exame.resultado.trim() || undefined,
        dataResultado: exame.dataResultadoLocal
          ? format(new Date(exame.dataResultadoLocal), "dd/MM/yyyy HH:mm")
          : undefined,
      }
      const p = await adicionarExame(idPaciente, body)
      await refreshAfterMutation(p)
      setExame((x) => ({
        ...x,
        nome: "",
        resultado: "",
        dataResultadoLocal: "",
      }))
      toast.success("Exame adicionado.")
    } catch (err) {
      toast.error("Erro ao adicionar exame", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setSubmitting(null)
    }
  }

  const onAddMedicamento = async (e: React.FormEvent) => {
    e.preventDefault()
    const idP = Number(medicamento.idPrescritor)
    if (
      !medicamento.nome.trim() ||
      !medicamento.dosagem.trim() ||
      !medicamento.frequencia.trim() ||
      !Number.isFinite(idP)
    ) {
      toast.error("Preencha todos os campos obrigatórios do medicamento.")
      return
    }
    setSubmitting("medicamento")
    try {
      const p = await adicionarMedicamento(idPaciente, {
        nome: medicamento.nome.trim(),
        dosagem: medicamento.dosagem.trim(),
        frequencia: medicamento.frequencia.trim(),
        idPrescritor: idP,
      })
      await refreshAfterMutation(p)
      setMedicamento((m) => ({
        ...m,
        nome: "",
        dosagem: "",
        frequencia: "",
      }))
      toast.success("Medicamento prescrito.")
    } catch (err) {
      toast.error("Erro ao prescrever medicamento", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setSubmitting(null)
    }
  }

  const onSaveAlergias = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting("alergias")
    try {
      const lista = alergiasTexto
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean)
      const p = await atualizarAlergias(idPaciente, lista)
      await refreshAfterMutation(p)
      toast.success("Alergias atualizadas.")
    } catch (err) {
      toast.error("Erro ao atualizar alergias", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setSubmitting(null)
    }
  }

  const carregarLogs = useCallback(async () => {
    setSubmitting("logs")
    try {
      const data = await buscarLogsAuditoria(idPaciente)
      setLogs(data)
    } catch (err) {
      toast.error("Erro ao carregar auditoria", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setSubmitting(null)
    }
  }, [idPaciente])

  useEffect(() => {
    if (tab !== "auditoria" || !prontuario) return
    void carregarLogs()
  }, [tab, prontuario, carregarLogs])

  if (!Number.isFinite(idPaciente)) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        ID de paciente inválido.
      </div>
    )
  }

  if (loading || !paciente) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Carregando...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="w-fit gap-2 -ml-2 text-muted-foreground" asChild>
            <Link href="/dashboard/pacientes">
              <ArrowLeft className="h-4 w-4" />
              Pacientes
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Prontuário</h1>
              <p className="text-muted-foreground">{paciente.nome}</p>
            </div>
          </div>
        </div>
        {prontuario && (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => void carregarProntuario()}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        )}
      </div>

      {!userIdStr && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              ID do usuário ausente
            </CardTitle>
            <CardDescription>
              O token não contém o campo <code className="text-xs">id</code> ou a sessão está incompleta.
              Faça logout e login novamente para usar o prontuário (cabeçalho{" "}
              <code className="text-xs">X-User-Id</code>).
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {semProntuario && !prontuario && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Nenhum prontuário para este paciente</CardTitle>
            <CardDescription>
              Crie o prontuário eletrônico para começar a registrar consultas, exames e prescrições.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => void handleCriarProntuario()} disabled={criando}>
              {criando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar prontuário
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {prontuario && (
        <Tabs value={tab} onValueChange={setTab} className="gap-4">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="visao" className="gap-1.5">
              <ClipboardList className="h-3.5 w-3.5" />
              Visão geral
            </TabsTrigger>
            <TabsTrigger value="consultas" className="gap-1.5">
              Consultas
            </TabsTrigger>
            <TabsTrigger value="exames" className="gap-1.5">
              <FlaskConical className="h-3.5 w-3.5" />
              Exames
            </TabsTrigger>
            <TabsTrigger value="medicamentos" className="gap-1.5">
              <Pill className="h-3.5 w-3.5" />
              Medicamentos
            </TabsTrigger>
            <TabsTrigger value="alergias" className="gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Alergias
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="gap-1.5">
              <ScrollText className="h-3.5 w-3.5" />
              Auditoria
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visao">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Identificação</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">ID paciente:</span>{" "}
                    {prontuario.idPaciente}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Documento MongoDB:</span>{" "}
                    <span className="font-mono text-xs">{prontuario.id}</span>
                  </p>
                  {prontuario.dataCriacao && (
                    <p>
                      <span className="text-muted-foreground">Criado em:</span>{" "}
                      {prontuario.dataCriacao}
                    </p>
                  )}
                  {prontuario.dataAtualizacao && (
                    <p>
                      <span className="text-muted-foreground">Atualizado em:</span>{" "}
                      {prontuario.dataAtualizacao}
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>Consultas: {prontuario.consultas?.length ?? 0}</p>
                  <p>Exames: {prontuario.exames?.length ?? 0}</p>
                  <p>Medicamentos: {prontuario.medicamentos?.length ?? 0}</p>
                  <p>Alergias: {prontuario.alergias?.length ?? 0}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="consultas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nova consulta</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onAddConsulta} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="idMedico">ID do médico</Label>
                    <Input
                      id="idMedico"
                      type="number"
                      value={consulta.idMedico}
                      onChange={(e) => setConsulta({ ...consulta, idMedico: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de atendimento</Label>
                    <Select
                      value={consulta.tipoAtendimento}
                      onValueChange={(v) => setConsulta({ ...consulta, tipoAtendimento: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONSULTA">Consulta</SelectItem>
                        <SelectItem value="RETORNO">Retorno</SelectItem>
                        <SelectItem value="EMERGENCIA">Emergência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="diagnostico">Diagnóstico</Label>
                    <Textarea
                      id="diagnostico"
                      value={consulta.diagnostico}
                      onChange={(e) => setConsulta({ ...consulta, diagnostico: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={consulta.observacoes}
                      onChange={(e) => setConsulta({ ...consulta, observacoes: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataHora">Data e hora (opcional)</Label>
                    <Input
                      id="dataHora"
                      type="datetime-local"
                      value={consulta.dataHoraLocal}
                      onChange={(e) => setConsulta({ ...consulta, dataHoraLocal: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" disabled={submitting === "consulta"}>
                      {submitting === "consulta" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Registrar"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Histórico</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/hora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Diagnóstico</TableHead>
                      <TableHead className="hidden md:table-cell">Obs.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(prontuario.consultas ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-muted-foreground text-center py-8">
                          Nenhuma consulta registrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...(prontuario.consultas ?? [])]
                        .reverse()
                        .map((c, i) => (
                          <TableRow key={`${c.dataHora}-${i}`}>
                            <TableCell className="whitespace-nowrap">{c.dataHora ?? "—"}</TableCell>
                            <TableCell>{c.tipoAtendimento}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{c.diagnostico}</TableCell>
                            <TableCell className="hidden md:table-cell max-w-xs truncate text-muted-foreground">
                              {c.observacoes ?? "—"}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exames" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Novo exame</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onAddExame} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="nomeExame">Nome do exame</Label>
                    <Input
                      id="nomeExame"
                      value={exame.nome}
                      onChange={(e) => setExame({ ...exame, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idSolicitante">ID do solicitante</Label>
                    <Input
                      id="idSolicitante"
                      type="number"
                      value={exame.idSolicitante}
                      onChange={(e) => setExame({ ...exame, idSolicitante: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataResultado">Data do resultado</Label>
                    <Input
                      id="dataResultado"
                      type="datetime-local"
                      value={exame.dataResultadoLocal}
                      onChange={(e) => setExame({ ...exame, dataResultadoLocal: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="resultado">Resultado</Label>
                    <Textarea
                      id="resultado"
                      value={exame.resultado}
                      onChange={(e) => setExame({ ...exame, resultado: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <Button type="submit" disabled={submitting === "exame"}>
                    {submitting === "exame" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Adicionar exame"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Exames registrados</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Solicitação</TableHead>
                      <TableHead>Resultado</TableHead>
                      <TableHead className="hidden md:table-cell">Data resultado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(prontuario.exames ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-muted-foreground text-center py-8">
                          Nenhum exame.
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...(prontuario.exames ?? [])]
                        .reverse()
                        .map((x, i) => (
                          <TableRow key={`${x.nome}-${i}`}>
                            <TableCell>{x.nome}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {x.dataSolicitacao ?? "—"}
                            </TableCell>
                            <TableCell className="max-w-[180px] truncate">{x.resultado ?? "—"}</TableCell>
                            <TableCell className="hidden md:table-cell whitespace-nowrap">
                              {x.dataResultado ?? "—"}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medicamentos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nova prescrição</CardTitle>
                <CardDescription>Conforme regra de negócio, apenas médicos podem prescrever.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onAddMedicamento} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="nomeMed">Medicamento</Label>
                    <Input
                      id="nomeMed"
                      value={medicamento.nome}
                      onChange={(e) => setMedicamento({ ...medicamento, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dosagem">Dosagem</Label>
                    <Input
                      id="dosagem"
                      value={medicamento.dosagem}
                      onChange={(e) => setMedicamento({ ...medicamento, dosagem: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequencia">Frequência</Label>
                    <Input
                      id="frequencia"
                      value={medicamento.frequencia}
                      onChange={(e) => setMedicamento({ ...medicamento, frequencia: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="idPrescritor">ID do prescritor</Label>
                    <Input
                      id="idPrescritor"
                      type="number"
                      value={medicamento.idPrescritor}
                      onChange={(e) => setMedicamento({ ...medicamento, idPrescritor: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={submitting === "medicamento"}>
                    {submitting === "medicamento" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Prescrever"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Prescrições</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicamento</TableHead>
                      <TableHead>Dosagem / freq.</TableHead>
                      <TableHead className="hidden sm:table-cell">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(prontuario.medicamentos ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-muted-foreground text-center py-8">
                          Nenhum medicamento.
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...(prontuario.medicamentos ?? [])]
                        .reverse()
                        .map((m, i) => (
                          <TableRow key={`${m.nome}-${i}`}>
                            <TableCell>{m.nome}</TableCell>
                            <TableCell className="text-sm">
                              {m.dosagem} · {m.frequencia}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                              {m.dataPrescricao ?? "—"}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alergias">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alergias</CardTitle>
                <CardDescription>Uma por linha ou separadas por vírgula.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSaveAlergias} className="space-y-4 max-w-2xl">
                  <Textarea
                    value={alergiasTexto}
                    onChange={(e) => setAlergiasTexto(e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <Button type="submit" disabled={submitting === "alergias"}>
                    {submitting === "alergias" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Salvar alergias"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auditoria">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Logs de auditoria</CardTitle>
                  <CardDescription>Acessos e alterações registrados no prontuário.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => void carregarLogs()} disabled={submitting === "logs"}>
                  {submitting === "logs" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Recarregar"}
                </Button>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/hora</TableHead>
                      <TableHead>Usuário (ID)</TableHead>
                      <TableHead>Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-muted-foreground text-center py-8">
                          {submitting === "logs" ? "Carregando..." : "Nenhum log."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log, i) => (
                        <TableRow key={`${log.dataHora}-${i}`}>
                          <TableCell className="whitespace-nowrap">{log.dataHora}</TableCell>
                          <TableCell>{log.idUsuario}</TableCell>
                          <TableCell>{log.acao}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
