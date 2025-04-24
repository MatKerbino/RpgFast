"use client"

import { useEffect, useRef } from "react"
import ChatMessage from "./chat-message"

export default function ChatContainer({ messages, currentUser, users, npcs }) {
  const messagesEndRef = useRef(null)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Função para colorir o nome do mestre no chat
  const renderMessageContent = (message) => {
    if (!message.content) return null

    // Verificar se é uma mensagem de rolagem de dados
    if (message.isDiceRoll) {
      const parts = message.content.split("rolou")
      const nickname = parts[0].trim()
      const restOfMessage = parts.slice(1).join("rolou")

      return (
        <>
          <span className={message.userId === users.find((u) => u.isMaster)?.id ? "text-red-500 font-bold" : ""}>
            {nickname}
          </span>
          <span> rolou{restOfMessage}</span>
        </>
      )
    }

    // Mensagem normal
    return message.content
  }

  // Encontrar todos os mestres
  const masterIds = users.filter((user) => user.isMaster).map((user) => user.id)

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          isCurrentUser={message.userId === currentUser.id}
          isMaster={masterIds.includes(message.userId)}
          renderContent={() => renderMessageContent(message)}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
