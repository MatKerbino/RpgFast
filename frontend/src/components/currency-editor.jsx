"use client"

import React from 'react';

export default function CurrencyEditor({ currency, onChange }) {
  const handleCurrencyChange = (type, value) => {
    // Garante que o valor seja um inteiro não negativo
    const numericValue = Math.max(0, parseInt(value, 10) || 0);
    onChange({
      ...currency,
      [type]: numericValue,
    });
  };

  return (
    <div>
      <h3 className="font-medium mb-2">Moedas</h3>
      <div className="grid grid-cols-3 gap-3 p-3 bg-card/50 rounded-md">
        {/* Bronze */}
        <div>
          <label htmlFor="bronze" className="block text-sm font-medium text-amber-700 mb-1">
            Bronze
          </label>
          <input
            id="bronze"
            type="number"
            min="0"
            value={currency?.bronze ?? 0} // Usa ?? para default 0 se currency ou bronze for null/undefined
            onChange={(e) => handleCurrencyChange('bronze', e.target.value)}
            className="w-full px-2 py-1 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
          />
        </div>
        {/* Silver */}
        <div>
          <label htmlFor="silver" className="block text-sm font-medium text-gray-400 mb-1">
            Prata
          </label>
          <input
            id="silver"
            type="number"
            min="0"
            value={currency?.silver ?? 0}
            onChange={(e) => handleCurrencyChange('silver', e.target.value)}
            className="w-full px-2 py-1 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
          />
        </div>
        {/* Gold */}
        <div>
          <label htmlFor="gold" className="block text-sm font-medium text-yellow-500 mb-1">
            Ouro
          </label>
          <input
            id="gold"
            type="number"
            min="0"
            value={currency?.gold ?? 0}
            onChange={(e) => handleCurrencyChange('gold', e.target.value)}
            className="w-full px-2 py-1 rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
          />
        </div>
      </div>
    </div>
  );
} 