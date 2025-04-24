"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context"

export default function LoginPage() {
  const [nickname, setNickname] = useState("")
  const [characterId, setCharacterId] = useState("")
  const [masterCode, setMasterCode] = useState("")
  const [showMasterSection, setShowMasterSection] = useState(false)
  const [error, setError] = useState("")
  const { login, isLoading, currentUser, isConnected } = useApp()
  const router = useRouter()

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (currentUser && isConnected) {
      router.push("/game")
    }
  }, [currentUser, isConnected, router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    if (!nickname.trim()) {
      setError("Por favor, insira um nickname.")
      return
    }

    if (!showMasterSection && !characterId.trim()) {
      setError("Por favor, insira o ID do personagem (3 dígitos).")
      return
    }

    if (characterId && characterId.length !== 3) {
      setError("O ID do personagem deve ter exatamente 3 dígitos.")
      return
    }

    try {
      const success = await login(nickname, showMasterSection ? masterCode : undefined, characterId)

      if (success) {
        router.push("/game")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error.message || "Falha no login. Verifique suas credenciais e tente novamente.")
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">RPG Fast</h1>
          <p className="text-foreground/80">Entre para começar sua aventura</p>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium mb-1 text-foreground">
                Nickname
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                placeholder="Seu nome de aventureiro"
                disabled={isLoading}
              />
            </div>

            {!showMasterSection && (
              <div>
                <label htmlFor="characterId" className="block text-sm font-medium mb-1 text-foreground">
                  ID do Personagem (3 dígitos)
                </label>
                <input
                  id="characterId"
                  type="text"
                  value={characterId}
                  onChange={(e) => {
                    // Permitir apenas números e limitar a 3 dígitos
                    const value = e.target.value.replace(/\D/g, "").slice(0, 3)
                    setCharacterId(value)
                  }}
                  className="w-full px-4 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  placeholder="123"
                  maxLength={3}
                  disabled={isLoading}
                />
                <p className="text-xs text-foreground/60 mt-1">Digite o ID de 3 dígitos fornecido pelo mestre.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowMasterSection(!showMasterSection)
                  setError("")
                }}
                className="text-sm text-accent hover:text-accent/80 transition-colors"
              >
                {showMasterSection ? "Entrar como Jogador" : "Entrar como Mestre"}
              </button>

              {showMasterSection && (
                <div className="mt-4 space-y-4 p-4 border border-border rounded-md">
                  <div>
                    <label htmlFor="masterCode" className="block text-sm font-medium mb-1 text-foreground">
                      Senha de Mestre
                    </label>
                    <input
                      id="masterCode"
                      type="password"
                      value={masterCode}
                      onChange={(e) => setMasterCode(e.target.value)}
                      className="w-full px-4 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                      placeholder="Digite sua senha de mestre"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
