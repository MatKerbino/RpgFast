"use client"

export default function SkillEditor({ skills, onChange }) {
  const handleUpdateSkill = (index, field, value) => {
    const updatedSkills = [...skills]
    updatedSkills[index] = {
      ...updatedSkills[index],
      [field]: field === "value" ? Number(value) : value,
    }
    onChange(updatedSkills)
  }

  return (
    <div>
      <h3 className="font-medium mb-2">Perícias</h3>
      <div className="space-y-2">
        {skills.map((skill, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`skill-${index}`}
                checked={skill.proficient}
                onChange={(e) => handleUpdateSkill(index, "proficient", e.target.checked)}
                className="mr-2"
              />
              <label htmlFor={`skill-${index}`} className="text-sm">
                {skill.name}
              </label>
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
      </div>
    </div>
  )
}
