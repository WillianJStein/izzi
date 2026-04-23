import React from 'react';
import { Download, FileText, Layout, ListChecks, ChevronRight } from 'lucide-react';
import { ProjectData } from '../types';
import { cn } from '../utils/cn';

interface StepsNavProps {
  activeStep: number;
  onStepChange: (step: number) => void;
  onGeneratePDF: () => void;
  projectData: ProjectData;
}

export const StepsNav: React.FC<StepsNavProps> = ({ activeStep, onStepChange, onGeneratePDF, projectData }) => {
  const steps = [
    { id: 0, label: 'Informações', icon: Layout },
    { id: 1, label: 'Requisitos', icon: ListChecks },
    { id: 2, label: 'Resumo', icon: FileText },
  ];

  const isComplete = projectData.name && projectData.requirements.length > 0;

  return (
    <div className="w-full glass-nav rounded-[24px] p-4 flex flex-col lg:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar w-full lg:w-auto">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => onStepChange(step.id)}
              className={cn(
                "flex items-center gap-3 p-2 rounded-xl transition-all duration-500 group shrink-0",
                activeStep === step.id
                  ? "bg-accent/5"
                  : "hover:bg-surface-muted/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 shadow-md",
                activeStep === step.id 
                  ? "bg-accent text-export-text shadow-accent/30" 
                  : activeStep > step.id
                    ? "bg-accent/20 text-accent/70 shadow-accent/5"
                    : "bg-surface-muted/80 text-text/50 group-hover:text-text/70"
              )}>
                <step.icon className={cn("w-5 h-5", activeStep === step.id ? "animate-pulse" : "")} />
              </div>
              <div className="flex flex-col items-start">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.2em] mb-0.5",
                  activeStep === step.id ? "text-accent" : activeStep > step.id ? "text-accent/70" : "text-text/50"
                )}>
                  0{step.id + 1}
                </span>
                <span className={cn(
                  "font-bold text-sm tracking-tight whitespace-nowrap transition-colors",
                  activeStep === step.id ? "text-text" : activeStep > step.id ? "text-text/70" : "text-text/60"
                )}>
                  {step.label}
                </span>
              </div>
            </button>
            {index < steps.length - 1 && (
              <ChevronRight className={cn(
                "w-5 h-5 shrink-0 hidden xl:block transition-colors",
                activeStep > index ? "text-accent/60" : "text-text/20"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-6 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-border/10 pt-4 lg:pt-0 lg:pl-6">
        <div className="hidden xl:flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-accent">Exportar</span>
          </div>
          <p className="text-[9px] font-bold text-text/20 uppercase tracking-[0.1em]">PDF Premium</p>
        </div>

        <button
          onClick={onGeneratePDF}
          disabled={!isComplete}
          className={cn(
            "flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-500 group/btn relative overflow-hidden",
            "bg-accent text-export-text shadow-lg shadow-accent/20 hover:shadow-accent/40",
            "hover:-translate-y-0.5 active:scale-95 disabled:opacity-20 disabled:shadow-none disabled:cursor-not-allowed"
          )}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          <Download className="w-5 h-5 text-export-text transition-transform group-hover/btn:-translate-y-0.5" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[9px] uppercase tracking-[0.1em] opacity-60">Gerar PDF</span>
            <span className="text-xs uppercase tracking-[0.05em]">Premium</span>
          </div>
        </button>
      </div>
    </div>
  );
};
