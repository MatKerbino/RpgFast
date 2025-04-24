"use client"

export default function CharacterDetails({ character, onAddItem, onAddAbility }) {
  if (!character) return null

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Attributes */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Atributos</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(character.attributes || {}).map(([key, value]) => (
            <div key={key} className="bg-card/50 p-2 rounded-md">
              <div className="text-sm text-foreground/70 capitalize">{key}</div>
              <div className="text-lg font-bold">{value}</div>
              <div className="text-xs text-foreground/50">Mod: {Math.floor((value - 10) / 2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Perícias</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(character.skills || []).map((skill, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-card/50 rounded-md">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${skill.proficient ? "bg-accent" : "bg-gray-600"}`}></div>
                <span className="text-sm">{skill.name}</span>
              </div>
              <span className="font-medium">{skill.value > 0 ? `+${skill.value}` : skill.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Abilities */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Habilidades</h3>
          <button
            onClick={onAddAbility}
            className="text-xs bg-primary/20 hover:bg-primary/30 text-primary-foreground px-2 py-1 rounded"
          >
            Adicionar
          </button>
        </div>
        {(character.abilities || []).length === 0 ? (
          <div className="text-sm text-foreground/50 p-2">Nenhuma habilidade</div>
        ) : (
          <div className="space-y-2">
            {(character.abilities || []).map((ability) => (
              <div key={ability.id} className="p-2 bg-card/50 rounded-md">
                <div className="font-medium">{ability.name}</div>
                <div className="text-sm text-foreground/70">{ability.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inventory */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Inventário</h3>
          <button
            onClick={onAddItem}
            className="text-xs bg-primary/20 hover:bg-primary/30 text-primary-foreground px-2 py-1 rounded"
          >
            Adicionar
          </button>
        </div>
        {(character.inventory || []).length === 0 ? (
          <div className="text-sm text-foreground/50 p-2">Inventário vazio</div>
        ) : (
          <div className="space-y-2">
            {(character.inventory || []).map((item) => (
              <div key={item.id} className="p-2 bg-card/50 rounded-md">
                <div className="flex justify-between">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm">Qtd: {item.quantity}</div>
                </div>
                <div className="text-sm text-foreground/70">{item.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Currency */}
      {character.currency && (
        <div>
          <h3 className="font-medium mb-2">Moedas</h3>
          <div className="flex space-x-4 p-2 bg-card/50 rounded-md">
            <div>
              <span className="text-amber-700 mr-1">●</span>
              <span>Bronze: {character.currency.bronze}</span>
            </div>
            <div>
              <span className="text-gray-400 mr-1">●</span>
              <span>Prata: {character.currency.silver}</span>
            </div>
            <div>
              <span className="text-yellow-500 mr-1">●</span>
              <span>Ouro: {character.currency.gold}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
