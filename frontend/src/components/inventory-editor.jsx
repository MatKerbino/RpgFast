"use client"

import React from 'react';
// import { Trash2 } from 'lucide-react'; // Remover importação do ícone

export default function InventoryEditor({ inventory, onChange }) {

  const handleQuantityChange = (itemId, newQuantity) => {
    const numericQuantity = Math.max(0, parseInt(newQuantity, 10) || 0);
    const updatedInventory = inventory.map(item =>
      item.id === itemId ? { ...item, quantity: numericQuantity } : item
    );
    onChange(updatedInventory);
  };

  const handleRemoveItem = (itemId) => {
    const updatedInventory = inventory.filter(item => item.id !== itemId);
    onChange(updatedInventory);
  };

  return (
    <div className="space-y-2">
      {inventory.length === 0 ? (
        <div className="text-sm text-foreground/50 p-2">Inventário vazio.</div>
      ) : (
        inventory.map((item) => (
          <div key={item.id} className="p-3 bg-card/50 rounded-md flex items-center space-x-3">
            {/* Informações do Item (Não editáveis aqui) */}
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-xs text-foreground/70">{item.description}</div>
            </div>

            {/* Editor de Quantidade */}
            <div className="flex items-center space-x-1">
              <label htmlFor={`quantity-${item.id}`} className="text-xs">Qtd:</label>
              <input
                id={`quantity-${item.id}`}
                type="number"
                min="0"
                value={item.quantity ?? 1}
                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                className="w-16 px-2 py-1 text-sm rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              />
            </div>

            {/* Botão Remover */}
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="p-1 text-red-500 hover:text-red-700"
              aria-label="Remover Item"
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