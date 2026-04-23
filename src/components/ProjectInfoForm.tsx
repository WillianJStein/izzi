import React, { useState, useRef } from 'react';
import { ProjectData, ProjectType } from '../types';
import { cn } from '../utils/cn';
import { CustomSelect } from './CustomSelect';
import { AIAssistButton } from './AIAssistButton';
import { FileText, Upload } from 'lucide-react';

interface ProjectInfoFormProps {
  data: ProjectData;
  onChange: (data: Partial<ProjectData>) => void;
  onTriggerChat: (message: string) => void;
  onPdfUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProjectInfoForm: React.FC<ProjectInfoFormProps> = ({ data, onChange, onTriggerChat, onPdfUpload }) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && files[0].type === 'application/pdf') {
      const event = {
        target: { files }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onPdfUpload(event);
    }
  };

  const handleFocus = (field: string) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setFocusedField(field);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setFocusedField(null);
    }, 200);
  };

  const handleAssist = (fieldName: string, label: string, type: 'write' | 'rewrite' | 'improve') => {
    const currentValue = (data as any)[fieldName] || '';
    let prompt = '';
    
    if (type === 'write') {
      prompt = `Pode me ajudar a escrever o campo "${label}" para o meu projeto?`;
    } else if (type === 'improve') {
      prompt = `Pode me ajudar a melhorar o que escrevi no campo "${label}": "${currentValue}"?`;
    } else if (type === 'rewrite') {
      prompt = `Pode me ajudar a reescrever com outras palavras o campo "${label}": "${currentValue}"?`;
    }

    onTriggerChat(prompt);
  };

  const inputClasses = "w-full bg-surface-muted border-2 border-border/10 text-text p-4 rounded-xl focus:outline-none focus:border-accent/40 focus:bg-surface outline-none transition-all duration-500 placeholder:text-text/20 text-sm font-medium shadow-inner";
  const labelClasses = "block text-[9px] font-black uppercase tracking-[0.2em] text-text/40 mb-2 ml-1";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* PDF Import Banner */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "p-6 rounded-2xl border-2 border-dashed flex flex-col sm:flex-row items-center justify-between gap-6 group transition-all duration-500",
          isDragging 
            ? "border-accent bg-accent/10 scale-[1.02] shadow-xl shadow-accent/10" 
            : "border-accent/20 bg-accent/5 hover:border-accent/40"
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500",
            isDragging ? "bg-accent text-export-text scale-110" : "bg-accent/10 text-accent group-hover:scale-110"
          )}>
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-accent mb-1">
              {isDragging ? "Solte para importar" : "Importar de PDF"}
            </h3>
            <p className="text-xs text-text/40 font-medium">
              {isDragging ? "A izi está pronta para ler seu arquivo!" : "Arraste um arquivo ou clique para selecionar."}
            </p>
          </div>
        </div>
        <label className="px-6 py-3 bg-accent text-export-text rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-accent-focus shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all duration-500 cursor-pointer flex items-center gap-2">
          <Upload className="w-3.5 h-3.5" />
          Selecionar Arquivo
          <input
            type="file"
            accept=".pdf"
            onChange={onPdfUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={labelClasses}>Nome do Projeto</label>
            {focusedField === 'name' && (
              <AIAssistButton onAssist={(type) => handleAssist('name', 'Nome do Projeto', type)} />
            )}
          </div>
          <input
            type="text"
            name="name"
            value={data.name || ''}
            onChange={handleChange}
            onFocus={() => handleFocus('name')}
            onBlur={handleBlur}
            placeholder="Ex: Novo E-commerce Premium"
            className={inputClasses}
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={labelClasses}>Cliente / Empresa</label>
            {focusedField === 'client' && (
              <AIAssistButton onAssist={(type) => handleAssist('client', 'Cliente / Empresa', type)} />
            )}
          </div>
          <input
            type="text"
            name="client"
            value={data.client || ''}
            onChange={handleChange}
            onFocus={() => handleFocus('client')}
            onBlur={handleBlur}
            placeholder="Ex: Tech Solutions Ltda"
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <CustomSelect
            label="Tipo de Projeto"
            value={data.type}
            onChange={(value) => onChange({ type: value as ProjectType })}
            options={[
              { value: 'sistema', label: 'Sistema Web / Mobile' },
              { value: 'website', label: 'Site Institucional / Landing Page' },
              { value: 'automação', label: 'Automação de Processos' },
            ]}
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={labelClasses}>Cronograma Estimado</label>
            {focusedField === 'timeline' && (
              <AIAssistButton onAssist={(type) => handleAssist('timeline', 'Cronograma Estimado', type)} />
            )}
          </div>
          <input
            type="text"
            name="timeline"
            value={data.timeline || ''}
            onChange={handleChange}
            onFocus={() => handleFocus('timeline')}
            onBlur={handleBlur}
            placeholder="Ex: 3 meses"
            className={inputClasses}
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={labelClasses}>Orçamento Estimado</label>
            {focusedField === 'budget' && (
              <AIAssistButton onAssist={(type) => handleAssist('budget', 'Orçamento Estimado', type)} />
            )}
          </div>
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-text/20 text-lg group-focus-within:text-accent transition-colors">R$</span>
            <input
              type="text"
              name="budget"
              value={data.budget || ''}
              onChange={handleChange}
              onFocus={() => handleFocus('budget')}
              onBlur={handleBlur}
              placeholder="0,00"
              className={cn(inputClasses, "pl-16")}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={labelClasses}>O Quê (O que é o produto/serviço?)</label>
            {focusedField === 'what' && (
              <AIAssistButton onAssist={(type) => handleAssist('what', 'O Quê', type)} />
            )}
          </div>
          <textarea
            name="what"
            value={data.what || ''}
            onChange={handleChange}
            onFocus={() => handleFocus('what')}
            onBlur={handleBlur}
            rows={4}
            placeholder="Ex: Uma plataforma de e-commerce..."
            className={cn(inputClasses, "resize-none leading-relaxed min-h-[120px]")}
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={labelClasses}>Porquê (Qual o valor de negócio?)</label>
            {focusedField === 'why' && (
              <AIAssistButton onAssist={(type) => handleAssist('why', 'Porquê', type)} />
            )}
          </div>
          <textarea
            name="why"
            value={data.why || ''}
            onChange={handleChange}
            onFocus={() => handleFocus('why')}
            onBlur={handleBlur}
            rows={4}
            placeholder="Ex: Expandir o alcance das vendas..."
            className={cn(inputClasses, "resize-none leading-relaxed min-h-[120px]")}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className={labelClasses}>Descrição Geral do Projeto</label>
          {focusedField === 'description' && (
            <AIAssistButton onAssist={(type) => handleAssist('description', 'Descrição Geral', type)} />
          )}
        </div>
        <textarea
          name="description"
          value={data.description || ''}
          onChange={handleChange}
          onFocus={() => handleFocus('description')}
          onBlur={handleBlur}
          rows={6}
          placeholder="Descreva brevemente o propósito do projeto..."
          className={cn(inputClasses, "resize-none leading-relaxed min-h-[180px]")}
        />
      </div>
    </div>
  );
};
