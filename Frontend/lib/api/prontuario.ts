import { apiRequest } from "@/lib/api/client"

export interface ProntuarioItem {
  id: string
  pacienteId: number
  descricao: string
  dataRegistro: string
}

export async function listarProntuarios() {
  return apiRequest<ProntuarioItem[]>("prontuario", "/prontuarios")
}

export async function buscarProntuarioPorPaciente(pacienteId: number) {
  return apiRequest<ProntuarioItem[]>("prontuario", `/prontuarios/paciente/${pacienteId}`)
}
