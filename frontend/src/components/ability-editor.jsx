"use client"

import React from 'react';
// import { Trash2 } from 'lucide-react'; // Remover importação do ícone

export default function AbilityEditor({ abilities, onChange }) {

  const handleRemoveAbility = (abilityId) => {
    const updatedAbilities = abilities.filter(ability => ability.id !== abilityId);
    onChange(updatedAbilities);
  };

  return (
    <div className="space-y-2">
      {abilities.length === 0 ? (
        <div className="text-sm text-foreground/50 p-2">Nenhuma habilidade.</div>
      ) : (
        abilities.map((ability) => (
          <div key={ability.id} className="p-3 bg-card/50 rounded-md flex items-start space-x-3">
            {/* Detalhes da Habilidade (Não editáveis aqui) */}
            <div className="flex-1">
              <div className="font-medium">{ability.name}</div>
              <div className="text-xs text-foreground/70 mt-1">{ability.description}</div>
              {/* Poderia adicionar outros detalhes aqui se existirem (type, cost, etc.) */}
            </div>

            {/* Botão Remover */}
            <button
              onClick={() => handleRemoveAbility(ability.id)}
              className="p-1 text-red-500 hover:text-red-700 mt-1"
              aria-label="Remover Habilidade"
            >
              {/* Substituir Ícone por Texto */}
              (X)
              {/* <Trash2 size={16} /> */}
            </button>
          </div>
        ))
      )}
    </div>
  );
} 