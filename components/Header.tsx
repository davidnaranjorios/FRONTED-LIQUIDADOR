import React from 'react';
import { CalculatorIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <CalculatorIcon className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800">Liquidador de Impuestos</span>
          </div>
        </div>
      </div>
    </header>
  );
};