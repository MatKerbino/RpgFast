// Mock data for the RPG app

// Mock API service
export const mockApiService = {
    login: async (nickname, masterCode) => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))
  
      if (!nickname) {
        return { user: {}, success: false }
      }
  
      const isMaster = !!masterCode && masterCode === "master123"
  
      const user = {
        id: Math.random().toString(36).substring(2, 9),
        nickname,
        isMaster,
        healthPoints: 100,
        maxHealthPoints: 100,
        diceResults: [],
      }
  
      return { user, success: true }
    },
  
    getUsers: async () => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      return [
        {
          id: "1",
          nickname: "DungeonMaster",
          isMaster: true,
          healthPoints: 100,
          maxHealthPoints: 100,
          diceResults: [20, 15, 8],
        },
        {
          id: "2",
          nickname: "Aragorn",
          isMaster: false,
          healthPoints: 85,
          maxHealthPoints: 100,
          diceResults: [18, 12, 5],
        },
        {
          id: "3",
          nickname: "Gandalf",
          isMaster: false,
          healthPoints: 60,
          maxHealthPoints: 80,
          diceResults: [20, 19, 17],
        },
        {
          id: "4",
          nickname: "Legolas",
          isMaster: false,
          healthPoints: 75,
          maxHealthPoints: 90,
          diceResults: [15, 10, 8],
        },
      ]
    },
  
    getMessages: async () => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      return [
        {
          id: "1",
          userId: "1",
          nickname: "DungeonMaster",
          content: "Bem-vindos à Taverna do Dragão Dourado!",
          timestamp: "2023-06-15T14:30:00Z",
        },
        {
          id: "2",
          userId: "2",
          nickname: "Aragorn",
          content: "Olá a todos, estou procurando informações sobre a Montanha Sombria.",
          timestamp: "2023-06-15T14:32:00Z",
        },
        {
          id: "3",
          userId: "3",
          nickname: "Gandalf",
          content: "Eu posso ajudar com isso, mas precisamos ser cautelosos.",
          timestamp: "2023-06-15T14:33:00Z",
        },
        {
          id: "4",
          userId: "2",
          nickname: "Aragorn",
          content: "Vou verificar se consigo encontrar algo útil.",
          timestamp: "2023-06-15T14:34:00Z",
        },
        {
          id: "5",
          userId: "2",
          nickname: "Aragorn",
          content: "Aragorn rolou d20: 18",
          timestamp: "2023-06-15T14:35:00Z",
          isDiceRoll: true,
          diceType: "d20",
          diceResult: 18,
        },
        {
          id: "6",
          userId: "1",
          nickname: "DungeonMaster",
          content: "Você encontra um mapa antigo escondido atrás de um quadro.",
          timestamp: "2023-06-15T14:36:00Z",
        },
        {
          id: "7",
          userId: "4",
          nickname: "Legolas",
          content: "Posso tentar decifrar o mapa?",
          timestamp: "2023-06-15T14:37:00Z",
        },
        {
          id: "8",
          userId: "4",
          nickname: "Legolas",
          content: "Legolas rolou d20: 15",
          timestamp: "2023-06-15T14:38:00Z",
          isDiceRoll: true,
          diceType: "d20",
          diceResult: 15,
        },
      ]
    },
  
    sendMessage: async (userId, nickname, content) => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 200))
  
      const newMessage = {
        id: Math.random().toString(36).substring(2, 9),
        userId,
        nickname,
        content,
        timestamp: new Date().toISOString(),
      }
  
      return newMessage
    },
  
    rollDice: async (userId, nickname, diceType, customValue) => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 200))
  
      let max = 20
      if (diceType === "d12") max = 12
      if (diceType === "d10") max = 10
      if (diceType === "d8") max = 8
      if (diceType === "d6") max = 6
      if (diceType === "d4") max = 4
      if (diceType === "custom" && customValue) max = customValue
  
      const result = Math.floor(Math.random() * max) + 1
  
      const newMessage = {
        id: Math.random().toString(36).substring(2, 9),
        userId,
        nickname,
        content: `${nickname} rolou ${diceType}: ${result}`,
        timestamp: new Date().toISOString(),
        isDiceRoll: true,
        diceType,
        diceResult: result,
      }
  
      return newMessage
    },
  
    getCharacter: async (userId) => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      return {
        userId: "2", // Aragorn
        attributes: {
          strength: 16,
          dexterity: 14,
          constitution: 15,
          intelligence: 12,
          wisdom: 14,
          charisma: 16,
        },
        skills: [
          { name: "Atletismo", value: 5, proficient: true },
          { name: "Acrobacia", value: 2, proficient: false },
          { name: "Furtividade", value: 4, proficient: true },
          { name: "Arcanismo", value: 1, proficient: false },
          { name: "História", value: 3, proficient: true },
          { name: "Natureza", value: 2, proficient: false },
          { name: "Percepção", value: 4, proficient: true },
          { name: "Persuasão", value: 5, proficient: true },
        ],
        abilities: [
          {
            id: "1",
            name: "Ataque Duplo",
            description: "Pode realizar dois ataques por turno com a ação principal.",
          },
          {
            id: "2",
            name: "Inspiração",
            description: "Uma vez por descanso longo, pode inspirar aliados em um raio de 10 metros.",
          },
        ],
        inventory: [
          {
            id: "1",
            name: "Espada Longa",
            description: "Espada de aço forjada pelos elfos. Dano: 1d8+2",
            quantity: 1,
          },
          {
            id: "2",
            name: "Poção de Cura",
            description: "Restaura 2d4+2 pontos de vida quando consumida.",
            quantity: 3,
          },
          {
            id: "3",
            name: "Corda Élfica",
            description: "15 metros de corda resistente e leve.",
            quantity: 1,
          },
        ],
        currency: {
          bronze: 25,
          silver: 15,
          gold: 5,
        },
      }
    },
  
    updateCharacter: async (character) => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      return character
    },
  }
  