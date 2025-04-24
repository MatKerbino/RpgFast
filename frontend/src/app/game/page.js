"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context"
import Link from "next/link"
import { Modal } from "@/components/ui/modal"
import CharacterBar from "@/components/character-bar"
import ChatContainer from "@/components/chat-container"
import MessageInput from "@/components/message-input"

export default function GameRoom() {
  const { currentUser, users, messages, sendMessage, rollDice, isLoading, isConnected, npcs } = useApp()
  const [showDiceModal, setShowDiceModal] = useState(false)
  const [customDice, setCustomDice] = useState("")
  const router = useRouter()

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/")
    }
  }, [currentUser, isLoading, router])

  if (!currentUser || !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-xl">Conectando ao servidor...</div>
          <div className="animate-spin h-8 w-8 border-t-2 border-accent rounded-full mx-auto"></div>
        </div>
      </div>
    )
  }

  const handleSendMessage = async (text) => {
    await sendMessage(text)
  }

  const handleRollDice = async (diceType, characterId = null) => {
    if (diceType === "custom") {
      const customValue = Number.parseInt(customDice)
      if (isNaN(customValue) || customValue <= 0) {
        alert("Por favor, insira um número válido maior que zero.")
        return
      }
      await rollDice("custom", characterId, customValue)
    } else {
      await rollDice(diceType, characterId)
    }

    setShowDiceModal(false)
    setCustomDice("")
  }

  // Combinar usuários e NPCs para exibição
  const allCharacters = [...users, ...npcs.filter((npc) => npc.showInChat)]

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Character bar - Fixed position */}
      <CharacterBar
        characters={allCharacters}
        currentUser={currentUser}
        onRollDice={(character, diceType) => handleRollDice(diceType, character.id)}
      />

      {/* Chat area - Scrollable */}
      <div className="flex-1 flex flex-col overflow-hidden pb-32">
        <ChatContainer messages={messages} currentUser={currentUser} users={users} npcs={npcs} />
      </div>

      {/* Message input - Fixed above navigation */}
      <div className="border-t border-border bg-background fixed bottom-0 w-full">
        <MessageInput onSendMessage={handleSendMessage} onOpenDiceModal={() => setShowDiceModal(true)} />

        {/* Navigation */}
        <nav className="bg-card border-t border-border p-4 flex justify-around">
          <Link href="/game" className="text-accent font-medium">
            Chat
          </Link>
          {currentUser.isMaster ? (
            <>
              <Link href="/master/characters" className="text-foreground/70 hover:text-accent">
                Personagens
              </Link>
              <Link href="/master/notes" className="text-foreground/70 hover:text-accent">
                Anotações
              </Link>
            </>
          ) : (
            <Link href="/character" className="text-foreground/70 hover:text-accent">
              Características
            </Link>
          )}
        </nav>
      </div>

      {/* Dice rolling modal */}
      <Modal isOpen={showDiceModal} onClose={() => setShowDiceModal(false)} title="Rolar Dados">
        <div className="space-y-4 bg-black">
          <div className="grid grid-cols-3 gap-2">
            {["d20", "d12", "d10", "d8", "d6", "d4"].map((dice) => (
              <button
                key={dice}
                onClick={() => handleRollDice(dice)}
                className="p-3 bg-primary/20 rounded-md hover:bg-primary/30 transition-colors"
              >
                {dice}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Dado Customizado</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={customDice}
                onChange={(e) => setCustomDice(e.target.value)}
                min="1"
                className="flex-1 px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                placeholder="Número de faces"
              />
              <button
                onClick={() => handleRollDice("custom")}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Rolar
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowDiceModal(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </main>
  )
}
