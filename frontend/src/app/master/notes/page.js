"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context"
import Link from "next/link"
import { Modal } from "@/components/ui/modal"
import ItemForm from "@/components/item-form"
import AbilityForm from "@/components/ability-form"

export default function MasterNotesPage() {
  const {
    currentUser,
    isLoading,
    addSharedItem,
    updateSharedItem,
    deleteSharedItem,
    addSharedAbility,
    updateSharedAbility,
    deleteSharedAbility,
    sharedItems,
    sharedAbilities,
  } = useApp()
  const [notes, setNotes] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showAddNoteModal, setShowAddNoteModal] = useState(false)
  const [showEditNoteModal, setShowEditNoteModal] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showEditItemModal, setShowEditItemModal] = useState(false)
  const [showAddAbilityModal, setShowAddAbilityModal] = useState(false)
  const [showEditAbilityModal, setShowEditAbilityModal] = useState(false)

  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    category: "story",
  })

  const [editingNote, setEditingNote] = useState(null)
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    type: "other",
    rarity: "common",
    value: "",
    weight: "",
    effect: "",
    isPublic: false,
  })

  const [editingItem, setEditingItem] = useState(null)

  const [newAbility, setNewAbility] = useState({
    name: "",
    description: "",
    type: "active",
    cost: "",
    range: "",
    duration: "",
    effect: "",
    isPublic: false,
  })

  const [editingAbility, setEditingAbility] = useState(null)

  const router = useRouter()

  const categories = [
    { id: "all", name: "Todos" },
    { id: "story", name: "História" },
    { id: "items", name: "Itens" },
    { id: "abilities", name: "Habilidades" },
    { id: "locations", name: "Locais" },
    { id: "npcs", name: "NPCs" },
    { id: "other", name: "Outros" },
  ]

  // Redirect if not logged in or not master
  useEffect(() => {
    if (!isLoading && (!currentUser || !currentUser.isMaster)) {
      router.push("/")
    }
  }, [currentUser, isLoading, router])

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("rpgfast_notes")
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes))
      } catch (e) {
        console.error("Error loading notes:", e)
      }
    }
  }, [])

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem("rpgfast_notes", JSON.stringify(notes))
    }
  }, [notes])

  const handleAddNote = () => {
    if (!newNote.title) return

    const note = {
      ...newNote,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    setNotes([...notes, note])
    setNewNote({
      title: "",
      content: "",
      category: "story",
    })
    setShowAddNoteModal(false)
  }

  const handleEditNote = (note) => {
    setEditingNote(note)
    setShowEditNoteModal(true)
  }

  const handleUpdateNote = () => {
    if (!editingNote) return

    const updatedNotes = notes.map((note) => (note.id === editingNote.id ? editingNote : note))

    setNotes(updatedNotes)
    setShowEditNoteModal(false)
  }

  const handleDeleteNote = (noteId) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId)
    setNotes(updatedNotes)
  }

  const handleAddItem = () => {
    if (!newItem.name) return

    const item = addSharedItem(newItem)

    setNewItem({
      name: "",
      description: "",
      type: "other",
      rarity: "common",
      value: "",
      weight: "",
      effect: "",
      isPublic: false,
    })

    setShowAddItemModal(false)
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setShowEditItemModal(true)
  }

  const handleUpdateItem = () => {
    if (!editingItem) return

    updateSharedItem(editingItem)
    setShowEditItemModal(false)
  }

  const handleDeleteItem = (itemId) => {
    deleteSharedItem(itemId)
  }

  const handleAddAbility = () => {
    if (!newAbility.name) return

    const ability = addSharedAbility(newAbility)

    setNewAbility({
      name: "",
      description: "",
      type: "active",
      cost: "",
      range: "",
      duration: "",
      effect: "",
      isPublic: false,
    })

    setShowAddAbilityModal(false)
  }

  const handleEditAbility = (ability) => {
    setEditingAbility(ability)
    setShowEditAbilityModal(true)
  }

  const handleUpdateAbility = () => {
    if (!editingAbility) return

    updateSharedAbility(editingAbility)
    setShowEditAbilityModal(false)
  }

  const handleDeleteAbility = (abilityId) => {
    deleteSharedAbility(abilityId)
  }

  const filteredNotes = selectedCategory === "all" ? notes : notes.filter((note) => note.category === selectedCategory)

  const renderNoteDetails = (note) => {
    if (note.category === "items") {
      return (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {note.details?.type && (
              <div>
                <span className="font-medium">Tipo:</span> {note.details.type}
              </div>
            )}
            {note.details?.rarity && (
              <div>
                <span className="font-medium">Raridade:</span> {note.details.rarity}
              </div>
            )}
            {note.details?.value && (
              <div>
                <span className="font-medium">Valor:</span> {note.details.value}
              </div>
            )}
            {note.details?.weight && (
              <div>
                <span className="font-medium">Peso:</span> {note.details.weight}
              </div>
            )}
          </div>
          {note.details?.effect && (
            <div className="mt-1 text-xs">
              <span className="font-medium">Efeito:</span> {note.details.effect}
            </div>
          )}
        </div>
      )
    } else if (note.category === "abilities") {
      return (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {note.details?.type && (
              <div>
                <span className="font-medium">Tipo:</span> {note.details.type}
              </div>
            )}
            {note.details?.cost && (
              <div>
                <span className="font-medium">Custo:</span> {note.details.cost}
              </div>
            )}
            {note.details?.range && (
              <div>
                <span className="font-medium">Alcance:</span> {note.details.range}
              </div>
            )}
            {note.details?.duration && (
              <div>
                <span className="font-medium">Duração:</span> {note.details.duration}
              </div>
            )}
          </div>
          {note.details?.effect && (
            <div className="mt-1 text-xs">
              <span className="font-medium">Efeito:</span> {note.details.effect}
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <main className="min-h-screen flex flex-col bg-background pb-20">
      <header className="bg-card border-b border-border p-4">
        <h1 className="text-2xl font-bold text-accent">Anotações do Mestre</h1>
        <p className="text-foreground/70">Gerencie suas anotações de campanha</p>
      </header>

      <div className="flex-1 p-4">
        {/* Categories and Add Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedCategory === category.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-card/80"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddItemModal(true)}
              className="px-3 py-1 bg-accent/80 text-accent-foreground rounded-md hover:bg-accent/90"
            >
              Novo Item
            </button>
            <button
              onClick={() => setShowAddAbilityModal(true)}
              className="px-3 py-1 bg-accent/80 text-accent-foreground rounded-md hover:bg-accent/90"
            >
              Nova Habilidade
            </button>
            <button
              onClick={() => setShowAddNoteModal(true)}
              className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Nova Anotação
            </button>
          </div>
        </div>

        {/* Items Section */}
        {(selectedCategory === "all" || selectedCategory === "items") && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-accent mb-4">Itens</h2>
            {sharedItems.length === 0 ? (
              <div className="text-center py-6 bg-card/50 rounded-lg">
                <p className="text-foreground/50">Nenhum item criado.</p>
                <button
                  onClick={() => setShowAddItemModal(true)}
                  className="mt-2 px-3 py-1 bg-primary/80 text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
                >
                  Criar Primeiro Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedItems.map((item) => (
                  <div key={item.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="text-xs bg-primary/20 hover:bg-primary/30 text-primary-foreground px-2 py-1 rounded"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-500 px-2 py-1 rounded"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>

                    <p className="text-sm mb-2">{item.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-border">
                      {item.type && (
                        <div>
                          <span className="font-medium">Tipo:</span> {item.type}
                        </div>
                      )}
                      {item.rarity && (
                        <div>
                          <span className="font-medium">Raridade:</span> {item.rarity}
                        </div>
                      )}
                      {item.value && (
                        <div>
                          <span className="font-medium">Valor:</span> {item.value}
                        </div>
                      )}
                      {item.weight && (
                        <div>
                          <span className="font-medium">Peso:</span> {item.weight}
                        </div>
                      )}
                    </div>
                    {item.effect && (
                      <div className="mt-1 text-xs">
                        <span className="font-medium">Efeito:</span> {item.effect}
                      </div>
                    )}

                    <div className="mt-3 pt-2 border-t border-border flex justify-between items-center">
                      <div className="text-xs">
                        {item.isPublic ? (
                          <span className="text-green-500">Disponível para jogadores</span>
                        ) : (
                          <span className="text-red-500">Privado (apenas mestre)</span>
                        )}
                      </div>
                      <div className="text-xs text-foreground/50">{new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Abilities Section */}
        {(selectedCategory === "all" || selectedCategory === "abilities") && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-accent mb-4">Habilidades</h2>
            {sharedAbilities.length === 0 ? (
              <div className="text-center py-6 bg-card/50 rounded-lg">
                <p className="text-foreground/50">Nenhuma habilidade criada.</p>
                <button
                  onClick={() => setShowAddAbilityModal(true)}
                  className="mt-2 px-3 py-1 bg-primary/80 text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
                >
                  Criar Primeira Habilidade
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedAbilities.map((ability) => (
                  <div key={ability.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{ability.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditAbility(ability)}
                          className="text-xs bg-primary/20 hover:bg-primary/30 text-primary-foreground px-2 py-1 rounded"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteAbility(ability.id)}
                          className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-500 px-2 py-1 rounded"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>

                    <p className="text-sm mb-2">{ability.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-border">
                      {ability.type && (
                        <div>
                          <span className="font-medium">Tipo:</span> {ability.type}
                        </div>
                      )}
                      {ability.cost && (
                        <div>
                          <span className="font-medium">Custo:</span> {ability.cost}
                        </div>
                      )}
                      {ability.range && (
                        <div>
                          <span className="font-medium">Alcance:</span> {ability.range}
                        </div>
                      )}
                      {ability.duration && (
                        <div>
                          <span className="font-medium">Duração:</span> {ability.duration}
                        </div>
                      )}
                    </div>
                    {ability.effect && (
                      <div className="mt-1 text-xs">
                        <span className="font-medium">Efeito:</span> {ability.effect}
                      </div>
                    )}

                    <div className="mt-3 pt-2 border-t border-border flex justify-between items-center">
                      <div className="text-xs">
                        {ability.isPublic ? (
                          <span className="text-green-500">Disponível para jogadores</span>
                        ) : (
                          <span className="text-red-500">Privado (apenas mestre)</span>
                        )}
                      </div>
                      <div className="text-xs text-foreground/50">
                        {new Date(ability.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Notes List */}
        {filteredNotes.length === 0 && selectedCategory !== "items" && selectedCategory !== "abilities" ? (
          <div className="text-center py-10 text-foreground/50">
            <p>Nenhuma anotação encontrada.</p>
          </div>
        ) : (
          selectedCategory !== "items" &&
          selectedCategory !== "abilities" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <div key={note.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{note.title}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="text-xs bg-primary/20 hover:bg-primary/30 text-primary-foreground px-2 py-1 rounded"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-500 px-2 py-1 rounded"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>

                  <div className="text-sm mb-2 whitespace-pre-wrap">{note.content}</div>

                  {renderNoteDetails(note)}

                  <div className="flex justify-between items-center text-xs text-foreground/50 mt-4 pt-2 border-t border-border">
                    <span className="capitalize">
                      {categories.find((c) => c.id === note.category)?.name || note.category}
                    </span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex justify-around">
        <Link href="/game" className="text-foreground/70 hover:text-accent">
          Chat
        </Link>
        <Link href="/master/characters" className="text-foreground/70 hover:text-accent">
          Personagens
        </Link>
        <Link href="/master/notes" className="text-accent font-medium">
          Anotações
        </Link>
      </nav>

      {/* Add Note Modal */}
      <Modal isOpen={showAddNoteModal} onClose={() => setShowAddNoteModal(false)} title="Nova Anotação">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Título</label>
            <input
              type="text"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Categoria</label>
            <select
              value={newNote.category}
              onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
            >
              {categories
                .filter((c) => c.id !== "all" && c.id !== "items" && c.id !== "abilities")
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Conteúdo</label>
            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              rows={6}
            ></textarea>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setShowAddNoteModal(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddNote}
              disabled={!newNote.title}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Note Modal */}
      <Modal isOpen={showEditNoteModal} onClose={() => setShowEditNoteModal(false)} title="Editar Anotação">
        {editingNote && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Título</label>
              <input
                type="text"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Categoria</label>
              <select
                value={editingNote.category}
                onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              >
                {categories
                  .filter((c) => c.id !== "all" && c.id !== "items" && c.id !== "abilities")
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Conteúdo</label>
              <textarea
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                rows={6}
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowEditNoteModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateNote}
                disabled={!editingNote.title}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={showAddItemModal} onClose={() => setShowAddItemModal(false)} title="Novo Item">
        <ItemForm item={newItem} onChange={setNewItem} />
        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={() => setShowAddItemModal(false)}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={handleAddItem}
            disabled={!newItem.name}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>
      </Modal>

      {/* Edit Item Modal */}
      <Modal isOpen={showEditItemModal} onClose={() => setShowEditItemModal(false)} title="Editar Item">
        {editingItem && (
          <>
            <ItemForm item={editingItem} onChange={setEditingItem} isEditing />
            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={() => setShowEditItemModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateItem}
                disabled={!editingItem.name}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Add Ability Modal */}
      <Modal isOpen={showAddAbilityModal} onClose={() => setShowAddAbilityModal(false)} title="Nova Habilidade">
        <AbilityForm ability={newAbility} onChange={setNewAbility} />
        <div className="flex justify-end space-x-2 pt-4">
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
      </Modal>

      {/* Edit Ability Modal */}
      <Modal isOpen={showEditAbilityModal} onClose={() => setShowEditAbilityModal(false)} title="Editar Habilidade">
        {editingAbility && (
          <>
            <AbilityForm ability={editingAbility} onChange={setEditingAbility} />
            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={() => setShowEditAbilityModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateAbility}
                disabled={!editingAbility.name}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </>
        )}
      </Modal>
    </main>
  )
}
