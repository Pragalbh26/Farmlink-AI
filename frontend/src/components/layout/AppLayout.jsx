import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export const AppLayout = ({ children, currentTab, onSelectTab }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-200">
      <Header currentTab={currentTab} onSelectTab={onSelectTab} />
      
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar currentTab={currentTab} onSelectTab={onSelectTab} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto max-w-5xl">
          {children}
        </main>
      </div>

      <BottomNav currentTab={currentTab} onSelectTab={onSelectTab} />
    </div>
  );
};
