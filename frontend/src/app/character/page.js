"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context"
import Link from "next/link"
import { Modal } from "@/components/ui/modal"

export default function CharacterPage() {
  const {
    currentUser,
    character,
    updateCharacter,
    isLoading,
    isConnected,
    sharedItems,
    sharedAbilities,
    addSharedItemToCharacter,
    addSharedAbilityToCharacter,
  } = useApp()

  const [localCharacter, setLocalCharacter] = useState(character)
  const router = useRouter()
  const [debounceTimeout, setDebounceTimeout] = useState(null); // State for debounce timer

  // Modais de edição
  const [showAttributesModal, setShowAttributesModal] = useState(false)
  const [showSkillsModal, setShowSkillsModal] = useState(false)
  const [showAbilitiesModal, setShowAbilitiesModal] = useState(false)
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [showCurrencyModal, setShowCurrencyModal] = useState(false)
  const [showSharedItemsModal, setShowSharedItemsModal] = useState(false)
  const [showSharedAbilitiesModal, setShowSharedAbilitiesModal] = useState(false)

  // Estado para edição de habilidade específica
  const [editingAbility, setEditingAbility] = useState(null)
  const [newAbilityName, setNewAbilityName] = useState("")
  const [newAbilityDescription, setNewAbilityDescription] = useState("")

  // Estado para adicionar nova habilidade
  const [showAddAbilityModal, setShowAddAbilityModal] = useState(false)
  const [newAbility, setNewAbility] = useState({ name: "", description: "" })

  // Estado para adicionar novo item ao inventário
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [newItem, setNewItem] = useState({ name: "", description: "", quantity: 1 })

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/")
    }
  }, [currentUser, isLoading, router])

  // Update local character when character changes
  useEffect(() => {
    if (character) {
      setLocalCharacter(character)
    }
  }, [character])

  if (!currentUser || !localCharacter || !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-xl">Carregando personagem...</div>
          <div className="animate-spin h-8 w-8 border-t-2 border-accent rounded-full mx-auto"></div>
        </div>
      </div>
    )
  }

  const handleUpdateAttributes = (attribute, value) => {
    if (!localCharacter) return

    const updatedAttributes = {
      ...localCharacter.attributes,
      [attribute]: value,
    }

    const updatedCharacter = {
      ...localCharacter,
      attributes: updatedAttributes,
    }

    setLocalCharacter(updatedCharacter)
  }

  const handleSaveAttributes = () => {
    if (localCharacter) {
      updateCharacter(localCharacter)
      setShowAttributesModal(false)
    }
  }

  const handleUpdateSkill = (index, field, value) => {
    if (!localCharacter) return

    const updatedSkills = [...localCharacter.skills]
    updatedSkills[index] = {
      ...updatedSkills[index],
      [field]: value,
    }

    const updatedCharacter = {
      ...localCharacter,
      skills: updatedSkills,
    }

    setLocalCharacter(updatedCharacter)
  }

  const handleSaveSkills = () => {
    if (localCharacter) {
      updateCharacter(localCharacter)
      setShowSkillsModal(false)
    }
  }

  const handleSaveAbility = (id) => {
    if (!localCharacter) return

    const updatedAbilities = localCharacter.abilities.map((ability) => {
      if (ability.id === id) {
        return {
          ...ability,
          name: newAbilityName || ability.name,
          description: newAbilityDescription || ability.description,
        }
      }
      return ability
    })

    const updatedCharacter = {
      ...localCharacter,
      abilities: updatedAbilities,
    }

    setLocalCharacter(updatedCharacter)
    updateCharacter(updatedCharacter)
    setEditingAbility(null)
  }

  const handleEditAbility = (id, name, description) => {
    setEditingAbility(id)
    setNewAbilityName(name)
    setNewAbilityDescription(description)
  }

  const handleDeleteAbility = (id) => {
    if (!localCharacter) return

    const updatedAbilities = localCharacter.abilities.filter((ability) => ability.id !== id)

    const updatedCharacter = {
      ...localCharacter,
      abilities: updatedAbilities,
    }

    setLocalCharacter(updatedCharacter)
    updateCharacter(updatedCharacter)
  }

  const handleAddAbility = () => {
    if (!localCharacter || !newAbility.name) return

    const updatedCharacter = {
      ...localCharacter,
      abilities: [
        ...localCharacter.abilities,
        {
          id: Math.random().toString(36).substring(2, 9),
          name: newAbility.name,
          description: newAbility.description,
        },
      ],
    }

    setLocalCharacter(updatedCharacter)
    updateCharacter(updatedCharacter)
    setNewAbility({ name: "", description: "" })
    setShowAddAbilityModal(false)
  }

  const handleUpdateInventoryItem = (id, field, value) => {
    if (!localCharacter) return

    const updatedInventory = localCharacter.inventory.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [field]: value,
        }
      }
      return item
    })

    const updatedCharacter = {
      ...localCharacter,
      inventory: updatedInventory,
    }

    setLocalCharacter(updatedCharacter)
  }

  const handleSaveInventory = () => {
    if (localCharacter) {
      updateCharacter(localCharacter)
      setShowInventoryModal(false)
    }
  }

  const handleDeleteInventoryItem = (id) => {
    if (!localCharacter) return

    const updatedInventory = localCharacter.inventory.filter((item) => item.id !== id)

    const updatedCharacter = {
      ...localCharacter,
      inventory: updatedInventory,
    }

    setLocalCharacter(updatedCharacter)
    updateCharacter(updatedCharacter)
  }

  const handleAddInventoryItem = () => {
    if (!localCharacter || !newItem.name) return

    const updatedCharacter = {
      ...localCharacter,
      inventory: [
        ...localCharacter.inventory,
        {
          id: Math.random().toString(36).substring(2, 9),
          name: newItem.name,
          description: newItem.description,
          quantity: newItem.quantity,
        },
      ],
    }

    setLocalCharacter(updatedCharacter)
    updateCharacter(updatedCharacter)
    setNewItem({ name: "", description: "", quantity: 1 })
    setShowAddItemModal(false)
  }

  const handleUpdateCurrency = (type, value) => {
    if (!localCharacter) return

    const updatedCurrency = {
      ...localCharacter.currency,
      [type]: value,
    }

    const updatedCharacter = {
      ...localCharacter,
      currency: updatedCurrency,
    }

    setLocalCharacter(updatedCharacter)
  }

  const handleSaveCurrency = () => {
    if (localCharacter) {
      updateCharacter(localCharacter)
      setShowCurrencyModal(false)
    }
  }

  const handleAddSharedItem = (itemId) => {
    addSharedItemToCharacter(currentUser.id, itemId)
    setShowSharedItemsModal(false)
  }

  const handleAddSharedAbility = (abilityId) => {
    addSharedAbilityToCharacter(currentUser.id, abilityId)
    setShowSharedAbilitiesModal(false)
  }

  // --- START: Health Handling ---
  const handleHealthChange = (field, value) => {
    if (!localCharacter) return;

    let numericValue = parseInt(value, 10) || 0;
    let updatedData = {};

    if (field === 'healthPoints') {
      // Garante 0 <= hp <= maxHp
      const maxHp = localCharacter.maxHealthPoints ?? 10;
      numericValue = Math.min(Math.max(0, numericValue), maxHp);
      updatedData = { healthPoints: numericValue };
    } else if (field === 'maxHealthPoints') {
      numericValue = Math.max(1, numericValue); // Max HP >= 1
      updatedData = { maxHealthPoints: numericValue };
      // Ajustar HP atual se exceder o novo máximo
      if (localCharacter.healthPoints > numericValue) {
        updatedData.healthPoints = numericValue;
      }
    }

    const updatedCharacter = {
      ...localCharacter,
      ...updatedData,
    };

    setLocalCharacter(updatedCharacter); // Atualiza UI imediatamente

    // Debounce para salvar
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    setDebounceTimeout(
      setTimeout(() => {
        updateCharacter({ id: currentUser.id, ...updatedData }); // Envia apenas o que mudou
      }, 750) // Atraso de 750ms
    );
  };
  // --- END: Health Handling ---

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10 shadow-md">
        <h1 className="text-2xl font-bold text-accent">Ficha de Personagem</h1>
        <p className="text-foreground/70">{currentUser.nickname}</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {/* --- START: Health Section --- */}
        <section className="mb-6">
          <h2 className="text-xl font-bold text-accent mb-3">Pontos de Vida</h2>
          <div className="bg-card border border-border rounded-lg p-4 flex items-center space-x-4">
             <div className="flex-1">
                <label htmlFor="currentHP" className="block text-sm font-medium mb-1 text-foreground/80">
                  Vida Atual
                </label>
                <input
                  id="currentHP"
                  type="number"
                  value={localCharacter.healthPoints ?? 10}
                  onChange={(e) => handleHealthChange('healthPoints', e.target.value)}
                  max={localCharacter.maxHealthPoints ?? 10}
                  min="0"
                  className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground text-lg font-semibold"
                />
              </div>
              <span className="text-2xl text-foreground/50 mt-6">/</span>
              <div className="flex-1">
                <label htmlFor="maxHP" className="block text-sm font-medium mb-1 text-foreground/80">
                  Vida Máxima
                </label>
                <input
                  id="maxHP"
                  type="number"
                  value={localCharacter.maxHealthPoints ?? 10}
                  onChange={(e) => handleHealthChange('maxHealthPoints', e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground text-lg font-semibold"
                />
              </div>
           </div>
        </section>
        {/* --- END: Health Section --- */}

        {/* Attributes Section */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-accent">Atributos</h2>
            <button
              onClick={() => setShowAttributesModal(true)}
              className="text-xs bg-primary/20 hover:bg-primary/30 text-primary-foreground px-2 py-1 rounded"
            >
              Editar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Object.entries(localCharacter.attributes).map(([key, value]) => (
              <div key={key} className="bg-card border border-border rounded-lg p-3 text-center">
                <div className="text-sm text-foreground/70 capitalize">{key}</div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-foreground/50">Modificador: {Math.floor((value - 10) / 2)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-accent">Perícias e Proficiências</h2>
            <button
              onClick={() => setShowSkillsModal(true)}
              className="text-xs bg-primary/20 hover:bg-primary/30 text-primary-foreground px-2 py-1 rounded"
            >
              Editar
            </button>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {localCharacter.skills.map((skill) => (
                <div key={skill.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${skill.proficient ? "bg-accent" : "bg-gray-600"}`}
                    ></div>
                    <span>{skill.name}</span>
                  </div>
                  <span className="font-medium">{skill.value > 0 ? `+${skill.value}` : skill.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Abilities Section */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-accent">Habilidades Extras</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowSharedAbilitiesModal(true)}
                className="text-xs bg-accent/20 hover:bg-accent/30 text-accent-foreground px-2 py-1 rounded"
              >
                Habilidades do Mestre
              </button>
              <button
                onClick={() => setShowAddAbilityModal(true)}
                className="text-xs bg-primary/20 hover:bg-primary/30 text-primary-foreground px-2 py-1 rounded"
              >
                Adicionar
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {localCharacter.abilities.map((ability) => (
              <div key={ability.id} className="bg-card border border-border rounded-lg p-4">
                {editingAbility === ability.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Nome</label>
                      <input
                        type="text"
                        value={newAbilityName}
                        onChange={(e) => setNewAbilityName(e.target.value)}
                        className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Descrição</label>
                      <textarea
                        value={newAbilityDescription}
                        onChange={(e) => setNewAbilityDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                        rows={3}
                      ></textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingAbility(null)}
                        className="px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveAbility(ability.id)}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold">{ability.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditAbility(ability.id, ability.name, ability.description)}
                          className="text-xs text-foreground/70 hover:text-accent"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteAbility(ability.id)}
                          className="text-xs text-red-500 hover:text-red-400"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{ability.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Inventory Section */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-accent">Mochila e Tesouro</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCurrencyModal(true)}
                className="text-xs bg-primary/20 hover:bg-primary/30 text-primary-foreground px-2 py-1 rounded"
              >
                Editar Moedas
              </button>
              <button
                onClick={() => setShowSharedItemsModal(true)}
                className="text-xs bg-accent/20 hover:bg-accent/30 text-accent-foreground px-2 py-1 rounded"
              >
                Itens do Mestre
              </button>
              <button
                onClick={() => setShowAddItemModal(true)}
                className="text-xs bg-primary/20 hover:bg-primary/30 text-primary-foreground px-2 py-1 rounded"
              >
                Adicionar Item
              </button>
            </div>
          </div>

          {/* Currency */}
          <div className="bg-card border border-border rounded-lg p-4 mb-3">
            <h3 className="font-medium mb-3">Moedas</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center">
                <span className="text-amber-700 mr-2">● Bronze:</span>
                <span>{localCharacter.currency.bronze}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">● Prata:</span>
                <span>{localCharacter.currency.silver}</span>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-2">● Ouro:</span>
                <span>{localCharacter.currency.gold}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {localCharacter.inventory.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold">{item.name}</div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm">Qtd: {item.quantity}</div>
                    <button
                      onClick={() => {
                        handleUpdateInventoryItem(item.id, "quantity", Math.max(1, item.quantity + 1))
                        handleSaveInventory()
                      }}
                      className="text-xs bg-green-700/30 hover:bg-green-700/50 px-2 py-0.5 rounded"
                    >
                      +
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateInventoryItem(item.id, "quantity", Math.max(1, item.quantity - 1))
                        handleSaveInventory()
                      }}
                      className="text-xs bg-red-700/30 hover:bg-red-700/50 px-2 py-0.5 rounded"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleDeleteInventoryItem(item.id)}
                      className="text-xs text-red-500 hover:text-red-400"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
                <p className="text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex justify-around">
        <Link href="/game" className="text-foreground/70 hover:text-accent">
          Chat
        </Link>
        <Link href="/character" className="text-accent font-medium">
          Características
        </Link>
      </nav>

      {/* Modals */}
      {/* Attributes Modal */}
      <Modal isOpen={showAttributesModal} onClose={() => setShowAttributesModal(false)} title="Editar Atributos">
        <div className="space-y-4">
          {Object.entries(localCharacter.attributes).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm font-medium capitalize">{key}</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateAttributes(key, Math.max(1, value - 1))}
                  className="w-8 h-8 flex items-center justify-center bg-red-500/20 rounded-md hover:bg-red-500/30"
                >
                  -
                </button>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleUpdateAttributes(key, Math.max(1, Number.parseInt(e.target.value) || 0))}
                  className="w-12 text-center px-2 py-1 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                  min="1"
                />
                <button
                  onClick={() => handleUpdateAttributes(key, value + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-green-500/20 rounded-md hover:bg-green-500/30"
                >
                  +
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowAttributesModal(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAttributes}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Salvar
            </button>
          </div>
        </div>
      </Modal>

      {/* Skills Modal */}
      <Modal isOpen={showSkillsModal} onClose={() => setShowSkillsModal(false)} title="Editar Perícias">
        <div className="space-y-4">
          {localCharacter.skills.map((skill, index) => (
            <div key={skill.name} className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`skill-${index}`}
                  checked={skill.proficient}
                  onChange={(e) => handleUpdateSkill(index, "proficient", e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor={`skill-${index}`}>{skill.name}</label>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateSkill(index, "value", Math.max(-5, skill.value - 1))}
                  className="w-8 h-8 flex items-center justify-center bg-red-500/20 rounded-md hover:bg-red-500/30"
                >
                  -
                </button>
                <input
                  type="number"
                  value={skill.value}
                  onChange={(e) => handleUpdateSkill(index, "value", Number.parseInt(e.target.value) || 0)}
                  className="w-12 text-center px-2 py-1 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                />
                <button
                  onClick={() => handleUpdateSkill(index, "value", skill.value + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-green-500/20 rounded-md hover:bg-green-500/30"
                >
                  +
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowSkillsModal(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveSkills}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Salvar
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Ability Modal */}
      <Modal isOpen={showAddAbilityModal} onClose={() => setShowAddAbilityModal(false)} title="Adicionar Habilidade">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Nome</label>
            <input
              type="text"
              value={newAbility.name}
              onChange={(e) => setNewAbility({ ...newAbility, name: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              placeholder="Nome da habilidade"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Descrição</label>
            <textarea
              value={newAbility.description}
              onChange={(e) => setNewAbility({ ...newAbility, description: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              rows={3}
              placeholder="Descrição da habilidade"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowAddAbilityModal(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddAbility}
              disabled={!newAbility.name}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={showAddItemModal} onClose={() => setShowAddItemModal(false)} title="Adicionar Item">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Nome</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              placeholder="Nome do item"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Descrição</label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              rows={3}
              placeholder="Descrição do item"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Quantidade</label>
            <input
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: Math.max(1, Number.parseInt(e.target.value) || 1) })}
              className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              min="1"
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowAddItemModal(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddInventoryItem}
              disabled={!newItem.name}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        </div>
      </Modal>

      {/* Currency Modal */}
      <Modal isOpen={showCurrencyModal} onClose={() => setShowCurrencyModal(false)} title="Editar Moedas">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Bronze</label>
            <input
              type="number"
              value={localCharacter.currency.bronze}
              onChange={(e) => handleUpdateCurrency("bronze", Math.max(0, Number.parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Prata</label>
            <input
              type="number"
              value={localCharacter.currency.silver}
              onChange={(e) => handleUpdateCurrency("silver", Math.max(0, Number.parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Ouro</label>
            <input
              type="number"
              value={localCharacter.currency.gold}
              onChange={(e) => handleUpdateCurrency("gold", Math.max(0, Number.parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              min="0"
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowCurrencyModal(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveCurrency}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Salvar
            </button>
          </div>
        </div>
      </Modal>

      {/* Shared Items Modal */}
      <Modal isOpen={showSharedItemsModal} onClose={() => setShowSharedItemsModal(false)} title="Itens do Mestre">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {sharedItems.filter((item) => item.isPublic).length === 0 ? (
            <div className="text-center py-4">
              <p className="text-foreground/50">Nenhum item disponível.</p>
              <p className="text-sm mt-2">O mestre ainda não compartilhou itens.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sharedItems
                .filter((item) => item.isPublic)
                .map((item) => (
                  <div key={item.id} className="p-3 bg-card/50 rounded-md flex justify-between items-center">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-foreground/70">{item.description}</div>
                    </div>
                    <button
                      onClick={() => handleAddSharedItem(item.id)}
                      className="px-2 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-xs"
                    >
                      Adicionar
                    </button>
                  </div>
                ))}
            </div>
          )}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowSharedItemsModal(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>

      {/* Shared Abilities Modal */}
      <Modal
        isOpen={showSharedAbilitiesModal}
        onClose={() => setShowSharedAbilitiesModal(false)}
        title="Habilidades do Mestre"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {sharedAbilities.filter((ability) => ability.isPublic).length === 0 ? (
            <div className="text-center py-4">
              <p className="text-foreground/50">Nenhuma habilidade disponível.</p>
              <p className="text-sm mt-2">O mestre ainda não compartilhou habilidades.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sharedAbilities
                .filter((ability) => ability.isPublic)
                .map((ability) => (
                  <div key={ability.id} className="p-3 bg-card/50 rounded-md flex justify-between items-center">
                    <div>
                      <div className="font-medium">{ability.name}</div>
                      <div className="text-sm text-foreground/70">{ability.description}</div>
                    </div>
                    <button
                      onClick={() => handleAddSharedAbility(ability.id)}
                      className="px-2 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-xs"
                    >
                      Adicionar
                    </button>
                  </div>
                ))}
            </div>
          )}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowSharedAbilitiesModal(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>
    </main>
  )
}
