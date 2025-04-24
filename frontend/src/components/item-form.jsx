"use client"

export default function ItemForm({ item, onChange, isEditing = false }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">Nome</label>
        <input
          type="text"
          value={item.name}
          onChange={(e) => onChange({ ...item, name: e.target.value })}
          className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
          placeholder="Nome do item"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">Descrição</label>
        <textarea
          value={item.description}
          onChange={(e) => onChange({ ...item, description: e.target.value })}
          className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
          rows={3}
          placeholder="Descrição do item"
        ></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">Tipo</label>
          <select
            value={item.type}
            onChange={(e) => onChange({ ...item, type: e.target.value })}
            className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
          >
            <option value="weapon">Arma</option>
            <option value="armor">Armadura</option>
            <option value="potion">Poção</option>
            <option value="scroll">Pergaminho</option>
            <option value="wand">Varinha</option>
            <option value="ring">Anel</option>
            <option value="amulet">Amuleto</option>
            <option value="tool">Ferramenta</option>
            <option value="other">Outro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">Raridade</label>
          <select
            value={item.rarity}
            onChange={(e) => onChange({ ...item, rarity: e.target.value })}
            className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
          >
            <option value="common">Comum</option>
            <option value="uncommon">Incomum</option>
            <option value="rare">Raro</option>
            <option value="veryRare">Muito Raro</option>
            <option value="legendary">Lendário</option>
            <option value="artifact">Artefato</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">Valor</label>
          <input
            type="text"
            value={item.value}
            onChange={(e) => onChange({ ...item, value: e.target.value })}
            className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
            placeholder="ex: 50 peças de ouro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">Peso</label>
          <input
            type="text"
            value={item.weight}
            onChange={(e) => onChange({ ...item, weight: e.target.value })}
            className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
            placeholder="ex: 2 kg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">Efeito</label>
        <textarea
          value={item.effect}
          onChange={(e) => onChange({ ...item, effect: e.target.value })}
          className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
          rows={3}
          placeholder="Efeito do item"
        ></textarea>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          checked={item.isPublic}
          onChange={(e) => onChange({ ...item, isPublic: e.target.checked })}
          className="mr-2"
        />
        <label htmlFor="isPublic" className="text-sm font-medium text-foreground">
          Disponibilizar para jogadores
        </label>
      </div>

      {isEditing && (
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">Quantidade</label>
          <input
            type="number"
            value={item.quantity || 1}
            onChange={(e) => onChange({ ...item, quantity: Math.max(1, Number.parseInt(e.target.value) || 1) })}
            className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
            min="1"
          />
        </div>
      )}
    </div>
  )
}
