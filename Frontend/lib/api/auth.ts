import { apiRequest } from "@/lib/api/client"
import type { LoginRequest, LoginResponse, UsuarioRequest, UsuarioResponse } from "@/lib/api/types"

export async function login(payload: LoginRequest) {
  return apiRequest<LoginResponse>("usuarios", "/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function cadastrarUsuario(payload: UsuarioRequest) {
  return apiRequest<UsuarioResponse>("usuarios", "/usuarios", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
