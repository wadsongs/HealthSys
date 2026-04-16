export type Perfil = "ADMINISTRADOR" | "MEDICO" | "ENFERMEIRO" | "RECEPCIONISTA"

export interface LoginRequest {
  email: string
  senha: string
}

export interface LoginResponse {
  token: string
  tipo: string
  nome: string
  email: string
  perfil: Perfil
}

export interface UsuarioRequest {
  nome: string
  email: string
  senha: string
  perfil: Perfil
}

export interface UsuarioResponse {
  id: number
  nome: string
  email: string
  perfil: Perfil
  ativo: boolean
  dataCadastro: string
}

export interface Vacina {
  id?: number
  nome: string
  dataAplicacao: string
  lote: string
}

export interface PacienteRequest {
  nome: string
  dataNascimento: string
  cpf: string
  sexo: string
  telefone: string
  alergias: string[]
  vacinas: Vacina[]
}

export interface PacienteResponse extends PacienteRequest {
  id: number
}
