import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

interface AIAssistButtonProps {
  onAssist: (type: 'write' | 'rewrite' | 'improve') => void;
  className?: string;
}

export const AIAssistButton: React.FC<AIAssistButtonProps> = ({ onAssist, className }) => {
  return (
    <div className={cn("flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-300", className)}>
      <button
        onClick={() => onAssist('write')}
        className="flex items-center gap-1.5 px-2 py-1 bg-accent/5 hover:bg-accent/10 text-accent rounded-md text-[9px] font-black uppercase tracking-widest transition-all border border-accent/10"
      >
        <Sparkles className="w-2.5 h-2.5" />
        Ajudar a Escrever
      </button>
      <button
        onClick={() => onAssist('improve')}
        className="flex items-center gap-1.5 px-2 py-1 bg-surface-muted hover:bg-surface text-text/40 hover:text-accent rounded-md text-[9px] font-black uppercase tracking-widest transition-all border border-border/10"
      >
        Melhorar
      </button>
    </div>
  );
};
