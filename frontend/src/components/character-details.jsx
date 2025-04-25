"use client"

import AttributeEditor from "./attribute-editor"
import SkillEditor from "./skill-editor"
import AbilityEditor from "./ability-editor"
import InventoryEditor from "./inventory-editor"
import CurrencyEditor from "./currency-editor"

export default function CharacterDetails({ character, onCharacterChange, onAddItem, onAddAbility }) {
  if (!character) return null

  const handleAttributeChange = (newAttributes) => {
    onCharacterChange({ ...character, attributes: newAttributes })
  }

  const handleSkillsChange = (newSkills) => {
    onCharacterChange({ ...character, skills: newSkills })
  }

  const handleAbilitiesChange = (newAbilities) => {
    onCharacterChange({ ...character, abilities: newAbilities })
  }

  const handleInventoryChange = (newInventory) => {
    onCharacterChange({ ...character, inventory: newInventory })
  }

  const handleCurrencyChange = (newCurrency) => {
    onCharacterChange({ ...character, currency: newCurrency })
  }

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
      {/* Attributes */}
      <AttributeEditor
        attributes={character.attributes || {}}
        onChange={handleAttributeChange}
      />

      {/* Skills */}
      <SkillEditor
        skills={character.skills || []}
        onChange={handleSkillsChange}
      />

      {/* Abilities */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Habilidades</h3>
          <button
            onClick={onAddAbility}
            className="text-xs bg-primary/20 hover:bg-primary/30 text-primary-foreground px-2 py-1 rounded"
          >
            Adicionar Nova
          </button>
        </div>
        <AbilityEditor
          abilities={character.abilities || []}
          onChange={handleAbilitiesChange}
        />
      </div>

      {/* Inventory */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Inventário</h3>
          <button
            onClick={onAddItem}
            className="text-xs bg-primary/20 hover:bg-primary/30 text-primary-foreground px-2 py-1 rounded"
          >
            Adicionar Novo
          </button>
        </div>
        <InventoryEditor
          inventory={character.inventory || []}
          onChange={handleInventoryChange}
        />
      </div>

      {/* Currency */}
      <CurrencyEditor
        currency={character.currency || { bronze: 0, silver: 0, gold: 0 }}
        onChange={handleCurrencyChange}
      />
    </div>
  )
}
