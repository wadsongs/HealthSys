import { apiRequest } from "@/lib/api/client"
import type { PacienteRequest, PacienteResponse, SpringPage } from "@/lib/api/types"

export async function listarPacientes() {
  const page = await apiRequest<SpringPage<PacienteResponse>>("pacientes", "/pacientes", { auth: true })
  return page.content
}

export async function buscarPaginaPacientes(params?: string) {
  return apiRequest<SpringPage<PacienteResponse>>(
    "pacientes",
    `/pacientes${params ? `?${params}` : ""}`,
    { auth: true }
  )
}

export async function listarPacientesRecentes(quantidade = 5) {
  const page = await apiRequest<SpringPage<PacienteResponse>>(
    "pacientes",
    `/pacientes?sort=dataCadastro,desc&size=${quantidade}`,
    { auth: true }
  )
  return { pacientes: page.content, total: page.totalElements }
}

export async function cadastrarPaciente(payload: PacienteRequest) {
  return apiRequest<PacienteResponse>("pacientes", "/pacientes", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: true,
  })
}

export async function buscarPacientePorId(id: number) {
  return apiRequest<PacienteResponse>("pacientes", `/pacientes/${id}`, { auth: true })
}

export async function deletarPaciente(id: number) {
  return apiRequest<void>("pacientes", `/pacientes/${id}`, {
    method: "DELETE",
    auth: true,
  })
}
