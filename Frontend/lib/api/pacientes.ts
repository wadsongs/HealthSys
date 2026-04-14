import { apiRequest } from "@/lib/api/client"
import type { PacienteRequest, PacienteResponse } from "@/lib/api/types"

export async function listarPacientes() {
  return apiRequest<PacienteResponse[]>("pacientes", "/pacientes")
}

export async function cadastrarPaciente(payload: PacienteRequest) {
  return apiRequest<PacienteResponse>("pacientes", "/pacientes", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function buscarPacientePorId(id: number) {
  return apiRequest<PacienteResponse>("pacientes", `/pacientes/${id}`)
}

export async function deletarPaciente(id: number) {
  return apiRequest<void>("pacientes", `/pacientes/${id}`, {
    method: "DELETE",
  })
}
