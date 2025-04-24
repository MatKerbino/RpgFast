"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context"
import Link from "next/link"
import { Modal } from "@/components/ui/modal"
import CharacterCard from "@/components/character-card"
import AttributeEditor from "@/components/attribute-editor"
import SkillEditor from "@/components/skill-editor"
import CharacterDetails from "@/components/character-details"
import axios from 'axios'

export default function MasterCharactersPage() {
  const {
    currentUser,
    users,
    isLoading,
    isConnected,
    updateHealth,
    updateCharacter,
    rollDice,
    sharedItems,
    sharedAbilities,
    addSharedItemToCharacter,
    addSharedAbilityToCharacter,
    npcs,
    addNpc,
    updateNpc,
    deleteNpc,
    createCharacter,
    deleteCharacter
  } = useApp()

  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddNpcModal, setShowAddNpcModal] = useState(false)
  const [showCreateCharacterModal, setShowCreateCharacterModal] = useState(false)
  const [showCharacterDetailsModal, setShowCharacterDetailsModal] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showAddAbilityModal, setShowAddAbilityModal] = useState(false)
  const [editedCharacter, setEditedCharacter] = useState(null)
  const [characterDetails, setCharacterDetails] = useState(null)
  const [newCharacterName, setNewCharacterName] = useState("")
  const [newCharacterId, setNewCharacterId] = useState("")
  const [createCharacterError, setCreateCharacterError] = useState("")
  const [createCharacterSuccess, setCreateCharacterSuccess] = useState("")
  const [isCreatingCharacter, setIsCreatingCharacter] = useState(false)
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");

  const [newNpc, setNewNpc] = useState({
    nickname: "",
    healthPoints: 10,
    maxHealthPoints: 10,
    showHealthBar: true,
    healthBarColor: "green",
    showInChat: false,
    notes: "",
    attributes: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    skills: [
      { name: "Atletismo", value: 0, proficient: false },
      { name: "Acrobacia", value: 0, proficient: false },
      { name: "Furtividade", value: 0, proficient: false },
      { name: "Arcanismo", value: 0, proficient: false },
      { name: "História", value: 0, proficient: false },
      { name: "Natureza", value: 0, proficient: false },
      { name: "Percepção", value: 0, proficient: false },
      { name: "Persuasão", value: 0, proficient: false },
    ],
    abilities: [],
    inventory: [],
    diceResults: [],
  })

  const router = useRouter()

  // Redirect if not logged in or not master
  useEffect(() => {
    if (!isLoading && (!currentUser || !currentUser.isMaster)) {
      router.push("/")
    }
  }, [currentUser, isLoading, router])

  if (!currentUser || !isConnected || !currentUser.isMaster) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-xl">Carregando...</div>
          <div className="animate-spin h-8 w-8 border-t-2 border-accent rounded-full mx-auto"></div>
        </div>
      </div>
    )
  }

  const handleEditCharacter = (character) => {
    setSelectedCharacter(character)
    setEditedCharacter({
      ...character,
      healthPoints: character.healthPoints || 100,
      maxHealthPoints: character.maxHealthPoints || 100,
    })
    setShowEditModal(true)
  }

  const handleDeleteCharacter = async (character) => {
    if (!window.confirm(`Deseja realmente deletar o personagem "${character.nickname}" (ID: ${character.characterId})?`)) {
      return;
    }

    try {
      await deleteCharacter(character.characterId);

      setDeleteSuccessMessage(`Personagem "${character.nickname}" (ID: ${character.characterId}) deletado com sucesso!`);

      setTimeout(() => setDeleteSuccessMessage(""), 3000);

    } catch (error) {
      console.error("Erro ao deletar personagem:", error);
      alert(`Falha ao excluir personagem: ${error.message}`);
    }
  }

  const handleViewCharacterDetails = async (character) => {
    try {
      // Use axios.get to fetch character details
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/character/${character.id}`);

      // Axios provides data directly in response.data
      const data = response.data;

      setCharacterDetails({
        ...data,
        nickname: character.nickname,
        id: character.id,
        isNpc: character.isNpc, // Assume isNpc comes from the character object passed in
      });
      setShowCharacterDetailsModal(true);

    } catch (error) {
      console.error("Error fetching character details:", error);
      // Check if the error is a 404 (Not Found) specifically
      if (error.response && error.response.status === 404) {
         // If character not found on server (like for NPCs), use local data
         if (character.isNpc) {
           setCharacterDetails(character);
           setShowCharacterDetailsModal(true);
         } else {
           alert("Erro: Personagem não encontrado no servidor.");
         }
      } else {
        // Handle other potential errors
        alert("Erro ao carregar detalhes do personagem.");
      }

      // Fallback to local data for NPCs even on other errors might be needed depending on desired logic
      // if (character.isNpc) {
      //   setCharacterDetails(character)
      //   setShowCharacterDetailsModal(true)
      // }
    }
  }

  const handleSaveCharacter = async () => {
    if (!editedCharacter) return

    // Update character health
    await updateHealth(editedCharacter.id, editedCharacter.healthPoints)

    setShowEditModal(false)
  }

  const handleAddNpc = () => {
    if (!newNpc.nickname) return

    addNpc(newNpc)
    setShowAddNpcModal(false)
  }

  const handleSaveNpc = () => {
    if (!editedCharacter) return

    updateNpc(editedCharacter)
    setShowEditModal(false)
  }

  const handleAddItemToCharacter = (itemId) => {
    if (!characterDetails) return

    addSharedItemToCharacter(characterDetails.id, itemId)
    setShowAddItemModal(false)
  }

  const handleAddAbilityToCharacter = (abilityId) => {
    if (!characterDetails) return

    addSharedAbilityToCharacter(characterDetails.id, abilityId)
    setShowAddAbilityModal(false)
  }

  const handleRollDiceForCharacter = (character, diceType = "d20") => {
    rollDice(diceType, character.id)
  }

  const handleRollDiceForNpc = (npc, diceType, customValue) => {
    // Implementar a lógica para rolar dados para o NPC
    rollDice(diceType, npc.id, customValue)
  }

  const handleCreateCharacter = async () => {
    if (!newCharacterName.trim()) {
      setCreateCharacterError("Por favor, insira um nome para o personagem.")
      return
    }
    if (!newCharacterId) {
      setCreateCharacterError("Por favor, insira um id válido")
      return
    }

    setIsCreatingCharacter(true)
    setCreateCharacterError("")
    setCreateCharacterSuccess("")

    try {
      const result = await createCharacter(newCharacterName, newCharacterId)

      if (result && result.success && result.user) {
        setCreateCharacterSuccess(
          `Personagem "${result.user.nickname}" criado com sucesso! ID: ${result.user.characterId}`,
        )
        setNewCharacterName("")
      } else {
        setCreateCharacterError("Erro ao criar personagem. Tente novamente.")
      }
    } catch (error) {
      console.error("Error creating character:", error)
      setCreateCharacterError(error.message || "Erro ao criar personagem. Tente novamente.")
    } finally {
      setIsCreatingCharacter(false)
    }
  }

  // Filtrar jogadores (excluindo o mestre)
  const playerCharacters = users.filter((user) => !user.isMaster)

  return (
    <main className="min-h-screen flex flex-col bg-background pb-20">
      <header className="bg-card border-b border-border p-4">
        <h1 className="text-2xl font-bold text-accent">Gerenciamento de Personagens</h1>
        <p className="text-foreground/70">Gerencie personagens e NPCs</p>
      </header>

      <div className="flex-1 p-4">
        {/* Botões de Ação */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-accent">Ações</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateCharacterModal(true)}
              className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Criar Personagem
            </button>
            <button
              onClick={() => setShowAddNpcModal(true)}
              className="px-3 py-1 bg-accent text-accent-foreground rounded-md hover:bg-accent/90"
            >
              Adicionar NPC
            </button>
          </div>
        </div>

        {/* Players Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-accent">Jogadores</h2>
          </div>

          {playerCharacters.length === 0 ? (
            <div className="bg-card/50 rounded-lg p-6 text-center">
              <p className="text-foreground/70 mb-2">Nenhum personagem jogador encontrado.</p>
              <p className="text-sm">Crie um novo personagem usando o botão "Criar Personagem".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playerCharacters.map((user) => (
                <CharacterCard
                  key={user.id}
                  character={user}
                  isMaster={true}
                  onEdit={handleEditCharacter}
                  onViewDetails={handleViewCharacterDetails}
                  onRollDice={handleRollDiceForCharacter}
                  onDelete={handleDeleteCharacter}
                />
              ))}
            </div>
          )}
        </section>

        {/* NPCs Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-accent">NPCs</h2>
            {deleteSuccessMessage && (
              <div className="ml-4 p-2 bg-green-600 text-white text-sm rounded-md">
                {deleteSuccessMessage}
              </div>
            )}
          </div>

          {npcs.length === 0 ? (
            <div className="bg-card/50 rounded-lg p-6 text-center">
              <p className="text-foreground/70 mb-2">Nenhum NPC encontrado.</p>
              <p className="text-sm">Adicione um novo NPC usando o botão "Adicionar NPC".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {npcs.map((npc) => (
                <CharacterCard
                  key={npc.id}
                  character={npc}
                  isMaster={true}
                  onEdit={handleEditCharacter}
                  onViewDetails={handleViewCharacterDetails}
                  onRollDice={handleRollDiceForNpc}
                  onDelete={deleteNpc}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex justify-around">
        <Link href="/game" className="text-foreground/70 hover:text-accent">
          Chat
        </Link>
        <Link href="/master/characters" className="text-accent font-medium">
          Personagens
        </Link>
        <Link href="/master/notes" className="text-foreground/70 hover:text-accent">
          Anotações
        </Link>
      </nav>

      {/* Create Character Modal */}
      <Modal
        isOpen={showCreateCharacterModal}
        onClose={() => {
          setShowCreateCharacterModal(false)
          setNewCharacterName("")
          setNewCharacterId("")
          setCreateCharacterError("")
          setCreateCharacterSuccess("")
        }}
        title="Criar Novo Personagem"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="characterName" className="block text-sm font-medium mb-1 text-foreground">
              Nome do Personagem
            </label>
            <input
              id="characterName"
              type="text"
              value={newCharacterName}
              onChange={(e) => setNewCharacterName(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              placeholder="Nome do personagem"
              disabled={isCreatingCharacter}
            />
            <label
              htmlFor="characterId"
              className="block text-sm font-medium mb-1 text-foreground mt-4"
            >
              ID do Personagem (3 dígitos)
            </label>
            <input
              id="characterId"
              type="text"
              value={newCharacterId}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 3)
                setNewCharacterId(val)
              }}
              className={`w-full px-3 py-2 rounded-md bg-background 
                focus:outline-none focus:ring-1 focus:ring-accent text-foreground border ${
                  newCharacterId.length === 0
                    ? 'border-border'       // neutro quando vazio
                    : newCharacterId.length < 3
                      ? 'border-red-500'    // vermelho em 1–2 dígitos
                      : 'border-green-500'  // verde em 3 dígitos
                }`}
              placeholder="123"
              disabled={isCreatingCharacter}
            />
          </div>

          {createCharacterError && <p className="text-red-500 text-sm">{createCharacterError}</p>}
          {createCharacterSuccess && <p className="text-green-500 text-sm">{createCharacterSuccess}</p>}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => {
                setShowCreateCharacterModal(false)
                setNewCharacterName("")
                setNewCharacterId("")
                setCreateCharacterError("")
                setCreateCharacterSuccess("")
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              disabled={isCreatingCharacter}
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateCharacter}
              disabled={
                isCreatingCharacter ||
                !newCharacterName.trim() ||
                newCharacterId.length !== 3
              }
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isCreatingCharacter ? "Criando..." : "Criar Personagem"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Character/NPC Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Editar ${selectedCharacter?.isNpc ? "NPC" : "Personagem"}`}
      >
        {editedCharacter && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Nome</label>
              <input
                type="text"
                value={editedCharacter.nickname}
                onChange={(e) => setEditedCharacter({ ...editedCharacter, nickname: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                disabled={!editedCharacter.isNpc}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Pontos de Vida</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={editedCharacter.healthPoints}
                  onChange={(e) =>
                    setEditedCharacter({
                      ...editedCharacter,
                      healthPoints: Math.max(0, Number.parseInt(e.target.value) || 0),
                    })
                  }
                  className="w-20 px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                  min="0"
                />
                <span>/</span>
                <input
                  type="number"
                  value={editedCharacter.maxHealthPoints}
                  onChange={(e) =>
                    setEditedCharacter({
                      ...editedCharacter,
                      maxHealthPoints: Math.max(1, Number.parseInt(e.target.value) || 1),
                    })
                  }
                  className="w-20 px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                  min="1"
                />
              </div>
            </div>

            {editedCharacter.isNpc && (
              <>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showHealthBar"
                    checked={editedCharacter.showHealthBar}
                    onChange={(e) =>
                      setEditedCharacter({
                        ...editedCharacter,
                        showHealthBar: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="showHealthBar" className="text-sm font-medium text-foreground">
                    Mostrar barra de vida
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showInChat"
                    checked={editedCharacter.showInChat}
                    onChange={(e) =>
                      setEditedCharacter({
                        ...editedCharacter,
                        showInChat: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="showInChat" className="text-sm font-medium text-foreground">
                    Mostrar no chat
                  </label>
                </div>

                {editedCharacter.showHealthBar && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Cor da barra de vida</label>
                    <select
                      value={editedCharacter.healthBarColor}
                      onChange={(e) =>
                        setEditedCharacter({
                          ...editedCharacter,
                          healthBarColor: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                    >
                      <option value="green">Verde</option>
                      <option value="red">Vermelho</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Anotações</label>
                  <textarea
                    value={editedCharacter.notes}
                    onChange={(e) => setEditedCharacter({ ...editedCharacter, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                    rows={3}
                  ></textarea>
                </div>
              </>
            )}

            {/* Attributes */}
            <AttributeEditor
              attributes={editedCharacter.attributes || {}}
              onChange={(attributes) => setEditedCharacter({ ...editedCharacter, attributes })}
            />

            {/* Skills */}
            {editedCharacter.skills && (
              <SkillEditor
                skills={editedCharacter.skills}
                onChange={(skills) => setEditedCharacter({ ...editedCharacter, skills })}
              />
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={editedCharacter.isNpc ? handleSaveNpc : handleSaveCharacter}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Salvar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add NPC Modal */}
      <Modal isOpen={showAddNpcModal} onClose={() => setShowAddNpcModal(false)} title="Adicionar NPC">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Nome</label>
            <input
              type="text"
              value={newNpc.nickname}
              onChange={(e) => setNewNpc({ ...newNpc, nickname: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Pontos de Vida</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={newNpc.healthPoints}
                onChange={(e) =>
                  setNewNpc({
                    ...newNpc,
                    healthPoints: Math.max(0, Number.parseInt(e.target.value) || 0),
                  })
                }
                className="w-20 px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                min="0"
              />
              <span>/</span>
              <input
                type="number"
                value={newNpc.maxHealthPoints}
                onChange={(e) =>
                  setNewNpc({
                    ...newNpc,
                    maxHealthPoints: Math.max(1, Number.parseInt(e.target.value) || 1),
                  })
                }
                className="w-20 px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                min="1"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showHealthBarNew"
              checked={newNpc.showHealthBar}
              onChange={(e) =>
                setNewNpc({
                  ...newNpc,
                  showHealthBar: e.target.checked,
                })
              }
              className="mr-2"
            />
            <label htmlFor="showHealthBarNew" className="text-sm font-medium text-foreground">
              Mostrar barra de vida
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showInChatNew"
              checked={newNpc.showInChat}
              onChange={(e) =>
                setNewNpc({
                  ...newNpc,
                  showInChat: e.target.checked,
                })
              }
              className="mr-2"
            />
            <label htmlFor="showInChatNew" className="text-sm font-medium text-foreground">
              Mostrar no chat
            </label>
          </div>

          {newNpc.showHealthBar && (
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Cor da barra de vida</label>
              <select
                value={newNpc.healthBarColor}
                onChange={(e) =>
                  setNewNpc({
                    ...newNpc,
                    healthBarColor: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              >
                <option value="green">Verde</option>
                <option value="red">Vermelho</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Anotações</label>
            <textarea
              value={newNpc.notes}
              onChange={(e) => setNewNpc({ ...newNpc, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              rows={3}
            ></textarea>
          </div>

          {/* Attributes */}
          <AttributeEditor
            attributes={newNpc.attributes}
            onChange={(attributes) => setNewNpc({ ...newNpc, attributes })}
          />

          {/* Skills */}
          <SkillEditor skills={newNpc.skills} onChange={(skills) => setNewNpc({ ...newNpc, skills })} />

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setShowAddNpcModal(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddNpc}
              disabled={!newNpc.nickname}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        </div>
      </Modal>

      {/* Character Details Modal */}
      <Modal
        isOpen={showCharacterDetailsModal}
        onClose={() => setShowCharacterDetailsModal(false)}
        title={`Detalhes de ${characterDetails?.nickname || "Personagem"}`}
      >
        {characterDetails && (
          <>
            <CharacterDetails
              character={characterDetails}
              onAddItem={() => setShowAddItemModal(true)}
              onAddAbility={() => setShowAddAbilityModal(true)}
            />
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowCharacterDetailsModal(false)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Add Item to Character Modal */}
      <Modal isOpen={showAddItemModal} onClose={() => setShowAddItemModal(false)} title="Adicionar Item ao Personagem">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {sharedItems.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-foreground/50">Nenhum item disponível.</p>
              <p className="text-sm mt-2">Crie itens na seção de Anotações.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sharedItems
                .filter((item) => item.isPublic !== false)
                .map((item) => (
                  <div key={item.id} className="p-3 bg-card/50 rounded-md flex justify-between items-center">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-foreground/70">{item.description}</div>
                    </div>
                    <button
                      onClick={() => handleAddItemToCharacter(item.id)}
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
              onClick={() => setShowAddItemModal(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Ability to Character Modal */}
      <Modal
        isOpen={showAddAbilityModal}
        onClose={() => setShowAddAbilityModal(false)}
        title="Adicionar Habilidade ao Personagem"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {sharedAbilities.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-foreground/50">Nenhuma habilidade disponível.</p>
              <p className="text-sm mt-2">Crie habilidades na seção de Anotações.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sharedAbilities
                .filter((ability) => ability.isPublic !== false)
                .map((ability) => (
                  <div key={ability.id} className="p-3 bg-card/50 rounded-md flex justify-between items-center">
                    <div>
                      <div className="font-medium">{ability.name}</div>
                      <div className="text-sm text-foreground/70">{ability.description}</div>
                    </div>
                    <button
                      onClick={() => handleAddAbilityToCharacter(ability.id)}
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
              onClick={() => setShowAddAbilityModal(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </main>
  )
}
