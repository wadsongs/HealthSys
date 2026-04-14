const TOKEN_KEY = "healthsys_token"
const USER_NAME_KEY = "healthsys_user_name"
const USER_PROFILE_KEY = "healthsys_user_profile"

const isBrowser = () => typeof window !== "undefined"

export function getToken(): string | null {
  if (!isBrowser()) return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function saveAuthSession(params: { token: string; nome?: string; perfil?: string }) {
  if (!isBrowser()) return

  window.localStorage.setItem(TOKEN_KEY, params.token)

  if (params.nome) {
    window.localStorage.setItem(USER_NAME_KEY, params.nome)
  }

  if (params.perfil) {
    window.localStorage.setItem(USER_PROFILE_KEY, params.perfil)
  }
}

export function clearAuthSession() {
  if (!isBrowser()) return
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_NAME_KEY)
  window.localStorage.removeItem(USER_PROFILE_KEY)
}

export function getStoredUser() {
  if (!isBrowser()) return { nome: null, perfil: null }

  return {
    nome: window.localStorage.getItem(USER_NAME_KEY),
    perfil: window.localStorage.getItem(USER_PROFILE_KEY),
  }
}
