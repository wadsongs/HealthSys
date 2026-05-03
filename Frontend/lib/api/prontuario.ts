import { apiRequest } from "@/lib/api/client"
import { getUserId } from "@/lib/auth-storage"
import type {
  ConsultaProntuario,
  ExameProntuario,
  LogAuditoriaProntuario,
  MedicamentoProntuario,
  ProntuarioModel,
} from "@/lib/api/types"

function requireUserId(): number {
  const id = getUserId()
  if (id == null) {
    throw new Error("ID do usuário não encontrado. Faça login novamente.")
  }
  return id
}

export async function criarProntuario(idPaciente: number) {
  return apiRequest<ProntuarioModel>("prontuario", `/prontuarios/${idPaciente}`, {
    method: "POST",
    auth: true,
  })
}

export async function buscarProntuario(idPaciente: number) {
  return apiRequest<ProntuarioModel>("prontuario", `/prontuarios/${idPaciente}`, {
    method: "GET",
    auth: true,
    userId: requireUserId(),
  })
}

export async function adicionarConsulta(idPaciente: number, consulta: ConsultaProntuario) {
  return apiRequest<ProntuarioModel>("prontuario", `/prontuarios/${idPaciente}/consultas`, {
    method: "POST",
    body: JSON.stringify(consulta),
    auth: true,
    userId: requireUserId(),
  })
}

export async function adicionarExame(idPaciente: number, exame: ExameProntuario) {
  return apiRequest<ProntuarioModel>("prontuario", `/prontuarios/${idPaciente}/exames`, {
    method: "POST",
    body: JSON.stringify(exame),
    auth: true,
    userId: requireUserId(),
  })
}

export async function adicionarMedicamento(idPaciente: number, medicamento: MedicamentoProntuario) {
  return apiRequest<ProntuarioModel>("prontuario", `/prontuarios/${idPaciente}/medicamentos`, {
    method: "POST",
    body: JSON.stringify(medicamento),
    auth: true,
    userId: requireUserId(),
  })
}

export async function atualizarAlergias(idPaciente: number, alergias: string[]) {
  return apiRequest<ProntuarioModel>("prontuario", `/prontuarios/${idPaciente}/alergias`, {
    method: "PUT",
    body: JSON.stringify(alergias),
    auth: true,
    userId: requireUserId(),
  })
}

export async function buscarLogsAuditoria(idPaciente: number) {
  return apiRequest<LogAuditoriaProntuario[]>(
    "prontuario",
    `/prontuarios/${idPaciente}/logs`,
    {
      method: "GET",
      auth: true,
    }
  )
}
