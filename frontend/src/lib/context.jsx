"use client"

import { createContext, useContext, useState, useEffect, useRef } from "react"
import axios from 'axios';

const AppContext = createContext(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.0.207:8000"
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://192.168.0.207:8000"

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [character, setCharacter] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [npcs, setNpcs] = useState([])
  const [sharedItems, setSharedItems] = useState([])
  const [sharedAbilities, setSharedAbilities] = useState([])
  const socketRef = useRef(null)

  // Função para conectar ao websocket
  const connectWebSocket = (userId) => {
    if (socketRef.current) {
      socketRef.current.close()
    }

    const socket = new WebSocket(`${WS_URL}/ws/${userId}`)

    socket.onopen = () => {
      console.log("WebSocket connected")
      setIsConnected(true)
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === "users") {
          setUsers(data.data)
        } else if (data.type === "messages") {
          setMessages(data.data)
        } else if (data.type === "character") {
          setCharacter(data.data)
        } else if (data.type === "shared_items") {
          setSharedItems(data.data)
        } else if (data.type === "shared_abilities") {
          setSharedAbilities(data.data)
        } else if (data.type === "npcs") {
          setNpcs(data.data)
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    socket.onclose = () => {
      console.log("WebSocket disconnected")
      setIsConnected(false)
    }

    socket.onerror = (error) => {
      console.error("WebSocket error:", error)
      setIsConnected(false)
    }

    socketRef.current = socket
  }

  // Desconectar websocket ao desmontar
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [])

  // Atualizar a função login para lidar corretamente com os diferentes tipos de login
  const login = async (nickname, masterCode, characterId) => {
    setIsLoading(true)
    try {
      // Use axios for the POST request
      const response = await axios.post(`${API_URL}/api/login`, {
        nickname: nickname,
        master_code: masterCode,
        character_id: characterId
      });

      console.log("Login response status:", response.status); // Para debug
      console.log("Login response data:", response.data); // Para debug

      const data = response.data; // Axios nests the response data under 'data'

      if (data.success) {
        setCurrentUser(data.user)
        // Conectar ao websocket após login bem-sucedido
        connectWebSocket(data.user.id)
        return true
      } else {
        // Handle potential errors returned in the 'data' object
        throw new Error(data.error || data.detail || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      // Axios wraps HTTP errors in an error object, access response data via error.response.data
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || "Login failed"
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Adicionar a função createCharacter para permitir que o mestre crie personagens
  const createCharacter = async (nickname, id) => {
    if (!currentUser || !currentUser.isMaster) {
      throw new Error("Apenas o mestre pode criar personagens")
    }
    try {
      const response = await axios.post(`${API_URL}/api/master/characters`, {
        master_id: currentUser.id,
        nickname: nickname,
        character_id: id
      });
      const data = response.data;
      return data
    } catch (error) {
      console.error("Error creating character:", error)
      const errorMessage = error.response?.data?.detail || error.message || "Falha ao criar personagem"
      throw new Error(errorMessage)
    }
  }

  const deleteCharacter = async (id) => {
    if (!currentUser || !currentUser.isMaster){
      throw new Error("Apenas o mestre pode excluir personagens")
    }

    console.log("Contexto recebeu ID para deletar:", id, "Tipo:", typeof id); // Debug log

    try {
      // Correção: Remover o corpo da requisição (segundo argumento)
      const response = await axios.delete(`${API_URL}/api/master/characters/${id}`);
      
      const data = response.data;
      return data
    } catch (error) {
      console.error("Error deleting character:", error)
      // Log a resposta de erro completa se disponível
      if (error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Response Status:', error.response.status);
        console.error('Error Response Headers:', error.response.headers);
      }
      const errorMessage = error.response?.data?.detail || error.message || "Falha ao deletar personagem"
      throw new Error(errorMessage)
    }
  }

  const sendMessage = async (content) => {
    if (!currentUser || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return

    try {
      socketRef.current.send(
        JSON.stringify({
          type: "message",
          content,
        }),
      )
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const rollDice = async (diceType, characterId = null, customValue) => {
    if (!currentUser || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return

    try {
      socketRef.current.send(
        JSON.stringify({
          type: "dice_roll",
          diceType,
          characterId,
          customValue,
        }),
      )
    } catch (error) {
      console.error("Error rolling dice:", error)
    }
  }

  const updateCharacter = async (updatedCharacter) => {
    if (!currentUser || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return

    try {
      socketRef.current.send(
        JSON.stringify({
          type: "update_character",
          data: updatedCharacter,
        }),
      )
    } catch (error) {
      console.error("Error updating character:", error)
    }
  }

  const updateHealth = async (userId, healthPoints) => {
    if (!currentUser || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return

    try {
      socketRef.current.send(
        JSON.stringify({
          type: "update_health",
          userId,
          healthPoints,
        }),
      )
    } catch (error) {
      console.error("Error updating health:", error)
    }
  }

  // Funções para gerenciar NPCs
  const addNpc = async (npc) => {
    if (!currentUser || !currentUser.isMaster) return null

    try {
      // Use axios for the POST request, send npc data in the 'data' field
      const response = await axios.post(`${API_URL}/api/npcs?master_id=${currentUser.id}`, npc);

      const newNpcs = response.data;
      setNpcs(newNpcs)

      return npc // Consider returning the created NPC data from response if available
    } catch (error) {
      console.error("Error adding NPC:", error)
      // Add error handling for user feedback if needed
      return null
    }
  }

  const updateNpc = async (updatedNpc) => {
    if (!currentUser || !currentUser.isMaster) return

    try {
      // Use axios for the PUT request, send updatedNpc data in the 'data' field
      await axios.put(`${API_URL}/api/npcs/${updatedNpc.id}`, updatedNpc);

      // Atualizar estado local
      const updatedNpcs = npcs.map((npc) => (npc.id === updatedNpc.id ? updatedNpc : npc))
      setNpcs(updatedNpcs)
    } catch (error) {
      console.error("Error updating NPC:", error)
      // Add error handling for user feedback if needed
    }
  }

  const deleteNpc = async (npcId) => {
    if (!currentUser || !currentUser.isMaster) return

    try {
      // Use axios for the DELETE request
      await axios.delete(`${API_URL}/api/npcs/${npcId}`);

      // Atualizar estado local
      const updatedNpcs = npcs.filter((npc) => npc.id !== npcId)
      setNpcs(updatedNpcs)
    } catch (error) {
      console.error("Error deleting NPC:", error)
      // Add error handling for user feedback if needed
    }
  }

  // Funções para gerenciar itens compartilhados
  const addSharedItem = (item) => {
    if (!currentUser || !currentUser.isMaster || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN)
      return null

    try {
      const newItem = {
        ...item,
        id: `item-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }

      socketRef.current.send(
        JSON.stringify({
          type: "add_shared_item",
          item: newItem,
        }),
      )

      return newItem
    } catch (error) {
      console.error("Error adding shared item:", error)
      return null
    }
  }

  const updateSharedItem = (updatedItem) => {
    if (!currentUser || !currentUser.isMaster || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN)
      return

    try {
      socketRef.current.send(
        JSON.stringify({
          type: "update_shared_item",
          item: updatedItem,
        }),
      )
    } catch (error) {
      console.error("Error updating shared item:", error)
    }
  }

  const deleteSharedItem = (itemId) => {
    if (!currentUser || !currentUser.isMaster || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN)
      return

    try {
      socketRef.current.send(
        JSON.stringify({
          type: "delete_shared_item",
          itemId,
        }),
      )
    } catch (error) {
      console.error("Error deleting shared item:", error)
    }
  }

  // Funções para gerenciar habilidades compartilhadas
  const addSharedAbility = (ability) => {
    if (!currentUser || !currentUser.isMaster || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN)
      return null

    try {
      const newAbility = {
        ...ability,
        id: `ability-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }

      socketRef.current.send(
        JSON.stringify({
          type: "add_shared_ability",
          ability: newAbility,
        }),
      )

      return newAbility
    } catch (error) {
      console.error("Error adding shared ability:", error)
      return null
    }
  }

  const updateSharedAbility = (updatedAbility) => {
    if (!currentUser || !currentUser.isMaster || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN)
      return

    try {
      socketRef.current.send(
        JSON.stringify({
          type: "update_shared_ability",
          ability: updatedAbility,
        }),
      )
    } catch (error) {
      console.error("Error updating shared ability:", error)
    }
  }

  const deleteSharedAbility = (abilityId) => {
    if (!currentUser || !currentUser.isMaster || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN)
      return

    try {
      socketRef.current.send(
        JSON.stringify({
          type: "delete_shared_ability",
          abilityId,
        }),
      )
    } catch (error) {
      console.error("Error deleting shared ability:", error)
    }
  }

  // Função para adicionar um item compartilhado ao inventário de um personagem
  const addSharedItemToCharacter = async (userId, itemId) => {
    const item = sharedItems.find((i) => i.id === itemId)
    if (!item || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return

    try {
      socketRef.current.send(
        JSON.stringify({
          type: "add_item_to_character",
          userId,
          item: {
            id: `char-item-${Date.now()}`,
            name: item.name,
            description: item.description,
            quantity: 1,
            type: item.type,
            rarity: item.rarity,
            value: item.value,
            weight: item.weight,
            effect: item.effect,
          },
        }),
      )
    } catch (error) {
      console.error("Error adding item to character:", error)
    }
  }

  // Função para adicionar uma habilidade compartilhada a um personagem
  const addSharedAbilityToCharacter = async (userId, abilityId) => {
    const ability = sharedAbilities.find((a) => a.id === abilityId)
    if (!ability || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return

    try {
      socketRef.current.send(
        JSON.stringify({
          type: "add_ability_to_character",
          userId,
          ability: {
            id: `char-ability-${Date.now()}`,
            name: ability.name,
            description: ability.description,
            type: ability.type,
            cost: ability.cost,
            range: ability.range,
            duration: ability.duration,
            effect: ability.effect,
          },
        }),
      )
    } catch (error) {
      console.error("Error adding ability to character:", error)
    }
  }

  const logout = () => {
    if (socketRef.current) {
      socketRef.current.close()
    }

    setCurrentUser(null)
    setUsers([])
    setMessages([])
    setCharacter(null)
    setIsConnected(false)
    setNpcs([])
    setSharedItems([])
    setSharedAbilities([])
  }

  const value = {
    currentUser,
    users,
    messages,
    character,
    isLoading,
    isConnected,
    npcs,
    sharedItems,
    sharedAbilities,
    login,
    createCharacter,
    deleteCharacter,
    sendMessage,
    rollDice,
    updateCharacter,
    updateHealth,
    addNpc,
    updateNpc,
    deleteNpc,
    addSharedItem,
    updateSharedItem,
    deleteSharedItem,
    addSharedAbility,
    updateSharedAbility,
    deleteSharedAbility,
    addSharedItemToCharacter,
    addSharedAbilityToCharacter,
    logout,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
