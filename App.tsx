import React from 'react';
import { Header } from './components/Header';
import { SettlementCalculatorView } from './views/SettlementCalculatorView';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <SettlementCalculatorView />
      </main>
    </div>
  );
};

export default App;