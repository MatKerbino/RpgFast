"use client"

export default function ChatMessage({ message, isCurrentUser, isMaster, renderContent }) {
  return (
    <div
      className={`p-2 rounded-lg max-w-[85%] ${
        isCurrentUser ? "ml-auto bg-primary/20" : "bg-card"
      } ${message.isDiceRoll ? "border border-accent/50" : ""}`}
    >
      <div className="font-medium text-sm">
        <span className={isMaster ? "text-red-500" : ""}>{message.nickname}</span>
        <span className="text-xs text-foreground/50 ml-2">{new Date(message.timestamp).toLocaleTimeString()}</span>
      </div>
      <div className="mt-1">{renderContent(message)}</div>
    </div>
  )
}
