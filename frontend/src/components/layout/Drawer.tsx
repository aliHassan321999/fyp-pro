import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {children}
        </div>
      </div>
    </>
  );
};

export default Drawer;
