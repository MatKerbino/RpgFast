"use client"

import { useEffect, useRef } from "react"

export default function Chat({ messages, currentUser, users, renderMessageContent }) {
  const messagesEndRef = useRef(null)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto mb-4 space-y-2 p-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-2 rounded-lg max-w-[85%] ${
            message.userId === currentUser.id ? "ml-auto bg-primary/20" : "bg-card"
          } ${message.isDiceRoll ? "border border-accent/50" : ""}`}
        >
          <div className="font-medium text-sm">
            <span className={message.userId === users.find((u) => u.isMaster)?.id ? "text-red-500" : ""}>
              {message.nickname}
            </span>
            <span className="text-xs text-foreground/50 ml-2">{new Date(message.timestamp).toLocaleTimeString()}</span>
          </div>
          <div className="mt-1">{renderMessageContent(message)}</div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
