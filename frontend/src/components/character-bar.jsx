"use client"
import CharacterCard from "./character-card-mini"

export default function CharacterBar({ characters, currentUser, onRollDice }) {
  // Ordenar personagens para que o mestre apareça primeiro, seguido por jogadores e depois NPCs
  const sortedCharacters = [...characters].sort((a, b) => {
    if (a.isMaster && !b.isMaster) return -1
    if (!a.isMaster && b.isMaster) return 1
    if (a.isNpc && !b.isNpc) return 1
    if (!a.isNpc && b.isNpc) return -1
    return 0
  })

  return (
    <header className="sticky top-0 z-20 bg-card border-b border-border p-2 overflow-x-auto shadow-md">
      <div className="flex space-x-2 min-w-max">
        {sortedCharacters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            isMaster={currentUser.isMaster}
            onRollDice={onRollDice}
          />
        ))}
      </div>
    </header>
  )
}
