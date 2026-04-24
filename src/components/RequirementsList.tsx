import React, { useState, useRef } from 'react';
import { Plus, Trash2, AlertCircle, Edit2, Check, History, X, Calendar, Clock, User } from 'lucide-react';
import { Requirement, BusinessRule, HistoryEntry } from '../types';
import { cn } from '../utils/cn';
import { CustomSelect } from './CustomSelect';
import { AIAssistButton } from './AIAssistButton';
import { motion, AnimatePresence } from 'motion/react';

interface RequirementsListProps {
  requirements: Requirement[];
  onAdd: (req: Requirement) => void;
  onUpdate: (req: Requirement) => void;
  onRemove: (id: string) => void;
  businessRules: BusinessRule[];
  onAddBusinessRule: (rule: BusinessRule) => void;
  onUpdateBusinessRule: (rule: BusinessRule) => void;
  onRemoveBusinessRule: (id: string) => void;
  showBusinessRules: boolean;
  onToggleBusinessRules: (show: boolean) => void;
  onTriggerChat: (message: string) => void;
  userName: string;
}

export const RequirementsList: React.FC<RequirementsListProps> = ({ 
  requirements, onAdd, onUpdate, onRemove,
  businessRules, onAddBusinessRule, onUpdateBusinessRule, onRemoveBusinessRule,
  showBusinessRules, onToggleBusinessRules,
  onTriggerChat,
  userName
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBRId, setEditingBRId] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [editObservation, setEditObservation] = useState('');
  const [originalReq, setOriginalReq] = useState<Requirement | null>(null);
  const [showHistoryId, setShowHistoryId] = useState<string | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const [newReq, setNewReq] = useState<Partial<Requirement>>({
    title: '',
    description: '',
    priority: 'média',
    type: 'funcional'
  });
  const [newBR, setNewBR] = useState<string>('');

  const handleAddOrUpdate = () => {
    if (!newReq.title || !newReq.description) return;
    
    const now = new Date().toISOString();
    
    if (editingId) {
      const existingReq = requirements.find(r => r.id === editingId);
      
      const changes: string[] = [];
      if (existingReq?.title !== newReq.title) changes.push('Título');
      if (existingReq?.description !== newReq.description) changes.push('Descrição');
      if (existingReq?.priority !== newReq.priority) changes.push('Prioridade');
      if (existingReq?.type !== newReq.type) changes.push('Tipo');

      const autoObs = changes.length > 0 ? `Ajuste em: ${changes.join(', ')}` : 'Alteração manual';
      const observation = editObservation || autoObs;

      const updatedHistory: HistoryEntry[] = [
        ...(existingReq?.history || []),
        { 
          date: now, 
          observation: observation,
          userName: userName
        }
      ];

      onUpdate({
        id: editingId,
        title: newReq.title as string,
        description: newReq.description as string,
        priority: newReq.priority as any,
        type: newReq.type as any,
        createdAt: existingReq?.createdAt || now,
        updatedAt: now,
        history: updatedHistory
      });
      setEditingId(null);
      setOriginalReq(null);
    } else {
      const id = crypto.randomUUID();
      onAdd({
        id,
        title: newReq.title as string,
        description: newReq.description as string,
        priority: newReq.priority as any,
        type: newReq.type as any,
        createdAt: now,
        updatedAt: now,
        history: [{ date: now, observation: 'Requisito criado', userName: userName }]
      });
    }

    setNewReq({
      title: '',
      description: '',
      priority: 'média',
      type: 'funcional'
    });
    setEditObservation('');
  };

  const handleAddOrUpdateBR = () => {
    if (!newBR) return;

    if (editingBRId) {
      onUpdateBusinessRule({
        id: editingBRId,
        description: newBR
      });
      setEditingBRId(null);
    } else {
      onAddBusinessRule({
        id: crypto.randomUUID(),
        description: newBR
      });
    }

    setNewBR('');
  };

  const startEdit = (req: Requirement) => {
    setEditingId(req.id);
    setOriginalReq(req);
    setNewReq({
      title: req.title,
      description: req.description,
      priority: req.priority,
      type: req.type
    });
    setEditObservation('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditBR = (rule: BusinessRule) => {
    setEditingBRId(rule.id);
    setNewBR(rule.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setOriginalReq(null);
    setNewReq({
      title: '',
      description: '',
      priority: 'média',
      type: 'funcional'
    });
    setEditObservation('');
  };

  const cancelEditBR = () => {
    setEditingBRId(null);
    setNewBR('');
  };

  const handleAssist = (label: string, currentValue: string, type: 'write' | 'rewrite' | 'improve') => {
    let prompt = '';
    
    if (label === 'Regra de Negócio') {
      prompt = `Pode me sugerir algumas regras de negócio para este projeto? Por favor, retorne uma lista de regras individuais usando o formato JSON [SUGGESTION:businessRules].`;
    } else if (label.includes('Requisito')) {
      if (currentValue) {
        prompt = `Pode me ajudar a melhorar este requisito? O valor atual do campo "${label}" é: "${currentValue}". Por favor, sugira melhorias para todos os campos (título, tipo, prioridade e descrição detalhada) usando o formato JSON [SUGGESTION:requirement].`;
      } else {
        prompt = `Pode me sugerir um novo requisito para este projeto? Por favor, preencha todos os campos (título, tipo, prioridade e descrição detalhada) usando o formato JSON [SUGGESTION:requirement].`;
      }
    } else {
      if (type === 'write') {
        prompt = `Pode me ajudar a escrever o campo "${label}" para o meu projeto?`;
      } else if (type === 'improve') {
        prompt = `Pode me ajudar a melhorar o que escrevi no campo "${label}": "${currentValue}"?`;
      } else if (type === 'rewrite') {
        prompt = `Pode me ajudar a reescrever com outras palavras o campo "${label}": "${currentValue}"?`;
      }
    }

    onTriggerChat(prompt);
  };

  const inputClasses = "w-full bg-surface-muted border-2 border-border/10 text-text p-4 rounded-xl focus:outline-none focus:border-accent/40 focus:bg-surface outline-none transition-all duration-500 placeholder:text-text/20 text-sm font-medium shadow-inner";

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-muted/30 border-2 border-border/5 shadow-sm">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input 
              type="checkbox" 
              checked={showBusinessRules} 
              onChange={(e) => onToggleBusinessRules(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-border/20 rounded-full peer peer-checked:bg-accent transition-all duration-500 shadow-inner" />
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 peer-checked:translate-x-4 shadow-md" />
          </div>
          <span className="font-black text-[10px] uppercase tracking-[0.1em] opacity-40 group-hover:opacity-100 transition-opacity">Incluir Regras de Negócio (RN)</span>
        </label>
      </div>

      {showBusinessRules && (
        <div className="p-6 sm:p-8 rounded-2xl border-2 border-purple-500/10 bg-purple-500/[0.02] space-y-6 animate-in fade-in zoom-in-95 duration-700">
          <h3 className="text-lg font-black flex items-center gap-3 tracking-tight text-purple-500">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              {editingBRId ? <Edit2 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
            </div>
            {editingBRId ? 'Editar Regra de Negócio' : 'Adicionar Regra de Negócio'}
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-500/40">Regra de Negócio</span>
                {focusedField === 'br' && (
                  <AIAssistButton onAssist={(type) => handleAssist('Regra de Negócio', newBR, type)} />
                )}
              </div>
              <input
                type="text"
                placeholder="Ex: O desconto máximo permitido é de 15%..."
                value={newBR || ''}
                onChange={e => setNewBR(e.target.value)}
                onFocus={() => handleFocus('br')}
                onBlur={handleBlur}
                className={cn(inputClasses, "flex-1")}
              />
            </div>
            <div className="flex gap-3 items-end">
              <button
                onClick={handleAddOrUpdateBR}
                disabled={!newBR}
                className="flex-1 sm:flex-none px-8 py-4 bg-purple-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:opacity-90 disabled:opacity-30 transition-all duration-500 flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20"
              >
                {editingBRId ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingBRId ? 'Salvar' : 'Adicionar'}
              </button>
              {editingBRId && (
                <button
                  onClick={cancelEditBR}
                  className="px-6 py-4 border-2 border-border/10 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-text/5 transition-all duration-500"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {Array.isArray(businessRules) && businessRules.map((rule) => (
              <div key={rule.id} className="p-4 rounded-xl border-2 border-purple-500/5 bg-surface flex justify-between items-center group hover:border-purple-500/20 transition-all duration-500 shadow-sm">
                <p className="font-bold text-sm text-text/80 leading-relaxed">{rule.description}</p>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <button onClick={() => startEditBR(rule)} className="p-2 text-purple-500 hover:bg-purple-500/10 rounded-lg transition-all duration-300"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onRemoveBusinessRule(rule.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 sm:p-8 rounded-2xl border-2 border-border/5 bg-surface-muted/20 space-y-8">
        <h3 className="text-lg font-black flex items-center gap-3 tracking-tight">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
            {editingId ? <Edit2 className="w-5 h-5 text-export-text" /> : <Plus className="w-5 h-5 text-export-text" />}
          </div>
          {editingId ? 'Editar Requisito' : 'Adicionar Requisito'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-text/40 ml-1">Título do Requisito</label>
              {focusedField === 'req-title' && (
                <AIAssistButton onAssist={(type) => handleAssist('Título do Requisito', newReq.title || '', type)} />
              )}
            </div>
            <input
              type="text"
              placeholder="Ex: Autenticação Biométrica"
              value={newReq.title || ''}
              onChange={e => setNewReq(prev => ({ ...prev, title: e.target.value }))}
              onFocus={() => handleFocus('req-title')}
              onBlur={handleBlur}
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-3">
              <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-text/40 ml-1">Tipo</label>
              <CustomSelect
                value={newReq.type || 'funcional'}
                onChange={value => setNewReq(prev => ({ ...prev, type: value as any }))}
                options={[
                  { value: 'funcional', label: 'Funcional' },
                  { value: 'não-funcional', label: 'Não Funcional' },
                ]}
              />
            </div>
            <div className="flex-1 space-y-3">
              <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-text/40 ml-1">Prioridade</label>
              <CustomSelect
                value={newReq.priority || 'média'}
                onChange={value => setNewReq(prev => ({ ...prev, priority: value as any }))}
                options={[
                  { value: 'baixa', label: 'Baixa' },
                  { value: 'média', label: 'Média' },
                  { value: 'alta', label: 'Alta' },
                ]}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-text/40 ml-1">Descrição Detalhada</label>
            {focusedField === 'req-desc' && (
              <AIAssistButton onAssist={(type) => handleAssist('Descrição do Requisito', newReq.description || '', type)} />
            )}
          </div>
          <textarea
            placeholder="Descreva o comportamento esperado deste requisito..."
            value={newReq.description || ''}
            onChange={e => setNewReq(prev => ({ ...prev, description: e.target.value }))}
            onFocus={() => handleFocus('req-desc')}
            onBlur={handleBlur}
            className={cn(inputClasses, "w-full resize-none h-32 leading-relaxed")}
          />
        </div>

        {editingId && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
            <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-accent ml-1">O que foi alterado nesta revisão? (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Refinamento da descrição, ajuste de prioridade..."
              value={editObservation || ''}
              onChange={e => setEditObservation(e.target.value)}
              className={cn(inputClasses, "py-3 italic")}
            />
          </div>
        )}

        <div className="flex gap-4">
          {editingId && (
            <button
              onClick={cancelEdit}
              className="flex-1 py-4 border-2 border-border/10 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-text/5 transition-all duration-500"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleAddOrUpdate}
            disabled={!newReq.title || !newReq.description}
            className="flex-[2] py-4 bg-accent text-export-text rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-accent-focus disabled:opacity-30 shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all duration-500 flex items-center justify-center gap-3"
          >
            {editingId ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {editingId ? 'Salvar Alterações' : 'Adicionar à Lista'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {(!Array.isArray(requirements) || requirements.length === 0) ? (
          <div className="text-center py-16 opacity-10 flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12" />
            <p className="text-lg font-black tracking-tighter uppercase">Nenhum requisito adicionado</p>
          </div>
        ) : (
          requirements.map((req) => (
            <div
              key={req.id}
              className={cn(
                "p-6 sm:p-8 rounded-2xl border-2 flex justify-between items-start gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 transition-all group relative overflow-hidden",
                editingId === req.id 
                  ? "border-accent bg-accent/[0.02] shadow-lg shadow-accent/10" 
                  : "border-border/5 bg-surface hover:border-accent/20 shadow-sm hover:shadow-md"
              )}
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-accent/5 group-hover:bg-accent transition-colors duration-700" />
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {(() => {
                    const prefix = req.type === 'funcional' ? 'RF' : 'RNF';
                    const typeIndex = requirements
                      .filter(r => r.type === req.type)
                      .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
                      .findIndex(r => r.id === req.id) + 1;
                    const id = `${prefix}${typeIndex.toString().padStart(2, '0')}`;
                    return (
                      <span className="text-[10px] font-black bg-accent/10 text-accent px-3 py-1 rounded-full border border-accent/20 min-w-[50px] text-center">
                        {id}
                      </span>
                    );
                  })()}
                  <span className={cn(
                    "text-[9px] uppercase font-black tracking-[0.2em] px-3 py-1 rounded-full border-2",
                    req.type === 'funcional' ? "bg-blue-500/5 text-blue-500 border-blue-500/10" : "bg-purple-500/5 text-purple-500 border-purple-500/10"
                  )}>
                    {req.type === 'funcional' ? 'Funcional' : 'Não Funcional'}
                  </span>
                  <span className={cn(
                    "text-[9px] uppercase font-black tracking-[0.2em] px-3 py-1 rounded-full border-2",
                    req.priority === 'alta' ? "bg-red-500/5 text-red-500 border-red-500/10" : 
                    req.priority === 'média' ? "bg-yellow-500/5 text-yellow-500 border-yellow-500/10" : 
                    "bg-green-500/5 text-green-500 border-green-500/10"
                  )}>
                    {req.priority === 'alta' ? 'Alta' : req.priority === 'média' ? 'Média' : 'Baixa'}
                  </span>
                </div>
                <h4 className="text-lg font-black tracking-tight mb-2 group-hover:text-accent transition-colors duration-500">{req.title}</h4>
                <p className="text-sm text-text/50 leading-relaxed font-medium">{req.description}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <button
                  onClick={() => setShowHistoryId(req.id)}
                  className="p-3 text-text/30 hover:text-accent hover:bg-accent/10 rounded-xl transition-all duration-300"
                  title="Ver Histórico"
                >
                  <History className="w-5 h-5" />
                </button>
                <button
                  onClick={() => startEdit(req)}
                  className="p-3 text-accent hover:bg-accent/10 rounded-xl transition-all duration-300"
                  title="Editar"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onRemove(req.id)}
                  className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                  title="Excluir"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* History Modal */}
      <AnimatePresence>
        {showHistoryId && (
          <motion.div
            key="history-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              key="history-modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-surface w-full max-w-2xl max-h-[80vh] rounded-[32px] border border-border shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-surface/40 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                    <History className="w-5 h-5 text-export-text" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">Histórico de Revisões</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text/40">
                      {requirements.find(r => r.id === showHistoryId)?.title || 'Requisito'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowHistoryId(null)}
                  className="p-2 hover:bg-surface-muted rounded-xl transition-all text-text/40 hover:text-text"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                {requirements.find(r => r.id === showHistoryId)?.history?.slice().reverse().map((entry, idx) => (
                  <div key={`${showHistoryId}-${entry.date}-${idx}`} className="relative pl-8 pb-4 last:pb-0">
                    {/* Timeline Line */}
                    <div className="absolute left-[11px] top-2 bottom-0 w-0.5 bg-border/30" />
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-surface border-4 border-accent shadow-sm flex items-center justify-center z-10" />
                    
                    <div className="bg-surface-muted/20 p-4 rounded-2xl border border-border/5">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent">
                          <Calendar className="w-3 h-3" />
                          {new Date(entry.date).toLocaleDateString()}
                          <Clock className="w-3 h-3 ml-2" />
                          {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text/40">
                          <User className="w-3 h-3" />
                          {entry.userName || 'Usuário'}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-text/80 leading-relaxed">
                        {entry.observation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
