"use client"

import { useState } from "react"

export default function MessageInput({ onSendMessage, onOpenDiceModal }) {
  const [messageText, setMessageText] = useState("")

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageText.trim()) return

    await onSendMessage(messageText)
    setMessageText("")
  }

  return (
    <div className="p-4 bg-background">
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="flex-1 px-4 py-2 rounded-md bg-card border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
          placeholder="Digite sua mensagem..."
        />
        <button
          type="button"
          onClick={onOpenDiceModal}
          className="px-3 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90"
          aria-label="Rolar dados"
        >
          🎲
        </button>
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Enviar
        </button>
      </form>
    </div>
  )
}
