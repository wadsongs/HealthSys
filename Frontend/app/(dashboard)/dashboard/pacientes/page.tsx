"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Search,
  UserPlus,
  MoreHorizontal,
  Trash2,
  Loader2,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { listarPacientes, deletarPaciente } from "@/lib/api/pacientes"
import type { PacienteResponse } from "@/lib/api/types"
import { toast } from "sonner"

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<PacienteResponse[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  const carregarPacientes = async () => {
    setIsLoading(true)
    try {
      const dados = await listarPacientes()
      setPacientes(dados)
    } catch (err) {
      toast.error("Erro ao carregar pacientes", {
        description: err instanceof Error ? err.message : "Verifique a API de pacientes.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void carregarPacientes()
  }, [])

  const filteredPacientes = useMemo(
    () =>
      pacientes.filter((paciente) => {
        const query = searchTerm.toLowerCase()
        return paciente.nome.toLowerCase().includes(query) || paciente.cpf.includes(searchTerm)
      }),
    [pacientes, searchTerm]
  )

  const handleDelete = async (id: number) => {
    setIsDeleting(id)
    try {
      await deletarPaciente(id)
      setPacientes((atual) => atual.filter((paciente) => paciente.id !== id))
      toast.success("Paciente removido com sucesso.")
    } catch (err) {
      toast.error("Erro ao remover paciente", {
        description: err instanceof Error ? err.message : "Tente novamente em instantes.",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground">Pacientes sincronizados com o backend</p>
        </div>
        <Link href="/dashboard/pacientes/novo">
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filtros</CardTitle>
          <CardDescription>Busque pacientes por nome ou CPF</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => void carregarPacientes()} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Atualizar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="hidden md:table-cell">CPF</TableHead>
                  <TableHead className="hidden lg:table-cell">Nascimento</TableHead>
                  <TableHead className="hidden sm:table-cell">Sexo</TableHead>
                  <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPacientes.map((paciente) => {
                  const initials = paciente.nome
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)

                  return (
                    <TableRow key={paciente.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{paciente.nome}</p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {paciente.cpf}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{paciente.cpf}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {paciente.dataNascimento}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{paciente.sexo}</TableCell>
                      <TableCell className="hidden lg:table-cell">{paciente.telefone}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/pacientes/${paciente.id}/prontuario`}
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <FileText className="h-4 w-4" />
                                Prontuário
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-destructive"
                              onClick={() => void handleDelete(paciente.id)}
                              disabled={isDeleting === paciente.id}
                            >
                              <Trash2 className="h-4 w-4" />
                              {isDeleting === paciente.id ? "Excluindo..." : "Excluir"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {!isLoading && filteredPacientes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">Nenhum paciente encontrado</p>
              <p className="text-sm text-muted-foreground">
                Tente ajustar os filtros ou cadastre um novo paciente
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando pacientes...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Mostrando {filteredPacientes.length} de {pacientes.length} pacientes
        </p>
      </div>
    </div>
  )
}
