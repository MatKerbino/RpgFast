"use client"

export default function AttributeEditor({ attributes, onChange }) {
  const handleUpdateAttribute = (key, value) => {
    onChange({
      ...attributes,
      [key]: Math.max(1, value),
    })
  }

  return (
    <div>
      <h3 className="font-medium mb-2">Atributos</h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(attributes || {}).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-sm capitalize">{key}</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleUpdateAttribute(key, Math.max(1, value - 1))}
                className="w-8 h-8 flex items-center justify-center bg-red-500/20 rounded-md hover:bg-red-500/30"
              >
                -
              </button>
              <input
                type="number"
                value={value}
                onChange={(e) => handleUpdateAttribute(key, Number.parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                min="1"
              />
              <button
                onClick={() => handleUpdateAttribute(key, value + 1)}
                className="w-8 h-8 flex items-center justify-center bg-green-500/20 rounded-md hover:bg-green-500/30"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
