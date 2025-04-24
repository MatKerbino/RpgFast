"use client"

export default function CharacterCardMini({ character, isMaster, onRollDice }) {
  return (
    <div
      className={`flex-shrink-0 w-40 p-2 rounded-md ${
        character.isMaster
          ? "border-2 border-red-500 animate-pulse-border"
          : character.isNpc
            ? "border-2 border-purple-500"
            : "border border-border"
      } bg-card`}
    >
      <div className="font-medium text-sm mb-1 truncate">
        {character.nickname} {character.isMaster && "(Mestre)"} {character.isNpc && "(NPC)"}
      </div>

      {character.showHealthBar !== false && (
        <>
          <div className="h-2 bg-gray-700 rounded-full mb-2">
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

          <div className="text-xs text-foreground/70">
            HP: {character.healthPoints}/{character.maxHealthPoints}
          </div>
        </>
      )}

      {isMaster && character.isNpc && (
        <button
          onClick={() => onRollDice(character, "d20")}
          className="mt-1 w-full text-xs bg-purple-500/20 hover:bg-purple-500/30 py-1 rounded"
        >
          Rolar d20
        </button>
      )}

      <div className="mt-1 flex space-x-1">
        {character.diceResults &&
          character.diceResults.slice(0, 3).map((result, index) => (
            <div key={index} className="w-6 h-6 flex items-center justify-center bg-primary/20 rounded-md text-xs">
              {result}
            </div>
          ))}
      </div>
    </div>
  )
}
