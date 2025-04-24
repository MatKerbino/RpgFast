"use client"

export default function AbilityForm({ ability, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">Nome</label>
        <input
          type="text"
          value={ability.name}
          onChange={(e) => onChange({ ...ability, name: e.target.value })}
          className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
          placeholder="Nome da habilidade"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">Descrição</label>
        <textarea
          value={ability.description}
          onChange={(e) => onChange({ ...ability, description: e.target.value })}
          className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
          rows={3}
          placeholder="Descrição da habilidade"
        ></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">Tipo</label>
          <select
            value={ability.type}
            onChange={(e) => onChange({ ...ability, type: e.target.value })}
            className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
          >
            <option value="passive">Passiva</option>
            <option value="active">Ativa</option>
            <option value="spell">Magia</option>
            <option value="feature">Característica</option>
            <option value="trait">Traço</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">Custo</label>
          <input
            type="text"
            value={ability.cost}
            onChange={(e) => onChange({ ...ability, cost: e.target.value })}
            className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
            placeholder="ex: 1 ponto de ação"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">Alcance</label>
          <input
            type="text"
            value={ability.range}
            onChange={(e) => onChange({ ...ability, range: e.target.value })}
            className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
            placeholder="ex: 9 metros"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">Duração</label>
          <input
            type="text"
            value={ability.duration}
            onChange={(e) => onChange({ ...ability, duration: e.target.value })}
            className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
            placeholder="ex: 1 minuto"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">Efeito</label>
        <textarea
          value={ability.effect}
          onChange={(e) => onChange({ ...ability, effect: e.target.value })}
          className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
          rows={3}
          placeholder="Efeito da habilidade"
        ></textarea>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          checked={ability.isPublic}
          onChange={(e) => onChange({ ...ability, isPublic: e.target.checked })}
          className="mr-2"
        />
        <label htmlFor="isPublic" className="text-sm font-medium text-foreground">
          Disponibilizar para jogadores
        </label>
      </div>
    </div>
  )
}
