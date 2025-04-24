"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"

export default function NpcDiceButton({ npc, onRollDice }) {
  const [showDiceModal, setShowDiceModal] = useState(false)
  const [customDice, setCustomDice] = useState("")

  const handleRollDice = (diceType) => {
    if (diceType === "custom") {
      const customValue = Number.parseInt(customDice)
      if (isNaN(customValue) || customValue <= 0) {
        alert("Por favor, insira um número válido maior que zero.")
        return
      }
      onRollDice(npc, diceType, customValue)
    } else {
      onRollDice(npc, diceType)
    }

    setShowDiceModal(false)
    setCustomDice("")
  }

  return (
    <>
      <button
        onClick={() => setShowDiceModal(true)}
        className="text-xs bg-accent/20 hover:bg-accent/30 text-accent-foreground px-2 py-1 rounded"
      >
        Rolar Dados
      </button>

      <Modal isOpen={showDiceModal} onClose={() => setShowDiceModal(false)} title={`Rolar Dados para ${npc.nickname}`}>
        <div className="space-y-4">
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
    </>
  )
}
