import { apiRequest } from "@/lib/api/client"
import type { SpringPage, StatusTriagem, TriagemRequest, TriagemResponse } from "@/lib/api/types"

export async function listarTriagens(params?: string) {
  return apiRequest<SpringPage<TriagemResponse>>("triagem", `/triagens${params ? `?${params}` : ""}`, {
    auth: true,
  })
}

export async function criarTriagem(payload: TriagemRequest) {
  return apiRequest<TriagemResponse>("triagem", "/triagens", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: true,
  })
}

export async function atualizarStatusTriagem(id: number, status: StatusTriagem) {
  return apiRequest<TriagemResponse>("triagem", `/triagens/${id}/status?status=${status}`, {
    method: "PATCH",
    auth: true,
  })
}
