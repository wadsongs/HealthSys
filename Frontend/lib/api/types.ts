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

export interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
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
  dataCadastro: string
  dataAtualizacao: string
}

/** Prontuário eletrônico (serviço :8083, formato de datas conforme API Java) */
export interface LogAuditoriaProntuario {
  idUsuario: number
  acao: string
  dataHora: string
}

export interface ConsultaProntuario {
  idMedico: number
  tipoAtendimento: string
  diagnostico: string
  observacoes?: string
  dataHora?: string
}

export interface ExameProntuario {
  nome: string
  idSolicitante: number
  resultado?: string
  dataSolicitacao?: string
  dataResultado?: string
}

export interface MedicamentoProntuario {
  nome: string
  dosagem: string
  frequencia: string
  idPrescritor: number
  dataPrescricao?: string
}

export interface ProntuarioModel {
  id: string
  idPaciente: number
  dataCriacao?: string
  dataAtualizacao?: string
  alergias: string[]
  consultas: ConsultaProntuario[]
  exames: ExameProntuario[]
  medicamentos: MedicamentoProntuario[]
  logs: LogAuditoriaProntuario[]
}

