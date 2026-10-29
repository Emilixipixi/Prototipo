import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { CODIGO_2FA, usuarios } from '../datos/datosEjemplo'
import type { Usuario } from '../tipos'

interface AuthContextoValor {
  usuario: Usuario | null
  pendiente2FA: boolean
  iniciarSesion: (correo: string, clave: string) => string | null
  verificarCodigo: (codigo: string) => string | null
  cancelar: () => void
  cerrarSesion: () => void
}

const AuthContext = createContext<AuthContextoValor | null>(null)

const CLAVE_SESION = 'sesionCobranzas'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const guardado = sessionStorage.getItem(CLAVE_SESION)
    return usuarios.find((u) => u.id === guardado) ?? null
  })
  const [candidato, setCandidato] = useState<Usuario | null>(null)

  const iniciarSesion = (correo: string, clave: string): string | null => {
    const encontrado = usuarios.find((u) => u.correo === correo.trim().toLowerCase() && u.clave === clave)
    if (!encontrado) return 'Correo o contraseña incorrectos'
    setCandidato(encontrado)
    return null
  }

  const verificarCodigo = (codigo: string): string | null => {
    if (!candidato) return 'Primero inicia sesión'
    if (codigo.trim() !== CODIGO_2FA) return 'Código incorrecto'
    sessionStorage.setItem(CLAVE_SESION, candidato.id)
    setUsuario(candidato)
    setCandidato(null)
    return null
  }

  const cancelar = () => setCandidato(null)

  const cerrarSesion = () => {
    sessionStorage.removeItem(CLAVE_SESION)
    setUsuario(null)
    setCandidato(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, pendiente2FA: candidato !== null, iniciarSesion, verificarCodigo, cancelar, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextoValor {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return contexto
}
