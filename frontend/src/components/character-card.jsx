"use client"
import NpcDiceButton from "./npc-dice-button"

export default function CharacterCard({ character, isMaster, onEdit, onViewDetails, onRollDice, onDelete }) {
  return (
    <div
      className={`bg-card border ${character.isMaster ? "border-2 border-red-500" : character.isNpc ? "border-2 border-purple-500" : "border-border"} rounded-lg p-4`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg flex items-center">
          {character.nickname} {character.isMaster && "(Mestre)"} {character.isNpc && "(NPC)"}
          {isMaster && character.characterId && (
            <span className="ml-2 text-xs font-mono bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
              ID: {character.characterId}
            </span>
          )}
        </h3>
        <div className="flex space-x-2">
          {isMaster && (
            <>
              <NpcDiceButton npc={character} onRollDice={onRollDice} />
              <button
                onClick={() => onEdit(character)}
                className="text-xs bg-primary/20 hover:bg-primary/30 text-primary-foreground px-2 py-1 rounded"
              >
                {character.isNpc ? "Editar" : "Editar HP"}
              </button>
              <button
                onClick={() => onViewDetails(character)}
                className="text-xs bg-accent/20 hover:bg-accent/30 text-accent-foreground px-2 py-1 rounded"
              >
                Detalhes
              </button>
              
              <button
                onClick={() => onDelete(character)}
                className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-500 px-2 py-1 rounded"
              >
                Excluir
              </button>
            </>
          )}
        </div>
      </div>

      {character.showHealthBar !== false && (
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>HP:</span>
            <span>
              {character.healthPoints}/{character.maxHealthPoints}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full">
            <div
              className={`h-2 rounded-full ${
                character.healthBarColor === "red"
                  ? "bg-red-500"
                  : character.healthPoints / character.maxHealthPoints <= 0.3
                    ? "bg-red-500"
                    : character.healthPoints / character.maxHealthPoints <= 0.6
                      ? "bg-yellow-500"
                      : "bg-green-500"
              }`}
              style={{ width: `${(character.healthPoints / character.maxHealthPoints) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-3">
        <div className="text-sm text-foreground/70">
          {character.isNpc
            ? character.showInChat
              ? "Visível no chat"
              : "Oculto no chat"
            : `Último dado: ${character.diceResults && character.diceResults[0] ? character.diceResults[0] : "-"}`}
        </div>
        <button
          onClick={() => onRollDice(character, "d20")}
          className="text-xs bg-purple-500/20 hover:bg-purple-500/30 px-2 py-1 rounded"
        >
          Rolar d20
        </button>
      </div>

      {character.notes && (
        <div className="mt-2 text-sm border-t border-border pt-2">
          <p className="text-foreground/70">{character.notes}</p>
        </div>
      )}
    </div>
  )
}
