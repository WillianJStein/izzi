import React from 'react';
import { ProjectData } from '../types';
import { CheckCircle2, Layout, ListChecks, Calendar, User, Target, HelpCircle, ShieldCheck, Edit2, History, Clock } from 'lucide-react';

interface SummaryProps {
  data: ProjectData;
  onChange: (newData: Partial<ProjectData>) => void;
  onGenerateSummary?: () => string;
}

export const Summary: React.FC<SummaryProps> = ({ data, onChange, onGenerateSummary }) => {
  const requirements = Array.isArray(data.requirements) ? data.requirements : [];
  const businessRules = Array.isArray(data.businessRules) ? data.businessRules : [];
  
  const functionalCount = requirements.filter(r => r.type === 'funcional').length;
  const nonFunctionalCount = requirements.filter(r => r.type === 'não-funcional').length;

  return (    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Last Modified Info */}
      {data.updatedAt && (
        <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 flex flex-wrap items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-accent/60">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Última Alteração: {new Date(data.updatedAt).toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Alterado por: {data.updatedBy || 'Desconhecido'}</span>
          </div>
          {data.lastChangeDescription && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>O que mudou: {data.lastChangeDescription}</span>
            </div>
          )}
        </div>
      )}

      {/* Project Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-surface border border-border/40 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-accent/5 transition-all duration-700 group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/40 to-accent/10" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-export-text transition-colors duration-500">
              <Layout className="w-5 h-5 text-accent group-hover:text-export-text" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text/30">Projeto</span>
          </div>
          <p className="text-lg font-black tracking-tight text-text truncate group-hover:text-accent transition-colors duration-500">{data.name || 'Sem nome'}</p>
        </div>
        
        <div className="p-6 rounded-2xl bg-surface border border-border/40 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-700 group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/40 to-emerald-500/10" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-500">
              <ListChecks className="w-5 h-5 text-emerald-500 group-hover:text-white" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text/30">Requisitos</span>
          </div>
          <p className="text-lg font-black tracking-tight text-text group-hover:text-emerald-500 transition-colors duration-500">{requirements.length} <span className="text-xs opacity-30 font-medium">Total</span></p>
          <div className="flex gap-2 mt-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-500/60">{functionalCount} RF</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-purple-500/60">{nonFunctionalCount} RNF</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border/40 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-700 group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/40 to-purple-500/10" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors duration-500">
              <Calendar className="w-5 h-5 text-purple-500 group-hover:text-white" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text/30">Prazo</span>
          </div>
          <p className="text-lg font-black tracking-tight text-text group-hover:text-purple-500 transition-colors duration-500">{data.timeline || 'Não definido'}</p>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border/40 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-700 group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/40 to-orange-500/10" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors duration-500">
              <Target className="w-5 h-5 text-orange-500 group-hover:text-white" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text/30">Orçamento</span>
          </div>
          <p className="text-lg font-black tracking-tight text-emerald-500 group-hover:text-orange-500 transition-colors duration-500">R$ {data.budget || '0,00'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {data.id && (
            <div className="p-8 rounded-2xl border-2 border-accent/10 bg-accent/[0.02] space-y-4 shadow-lg">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
                    <Edit2 className="w-6 h-6 text-export-text" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-accent">O que mudou nesta versão?</h3>
                </div>
                {onGenerateSummary && (
                  <button
                    onClick={() => onChange({ lastChangeDescription: onGenerateSummary() })}
                    className="text-[9px] font-black uppercase tracking-widest text-accent hover:text-accent-focus transition-colors px-3 py-1.5 rounded-lg bg-accent/5 border border-accent/10 hover:bg-accent/10 flex items-center gap-2 group/btn"
                  >
                    <History className="w-3 h-3 group-hover/btn:rotate-12 transition-transform" />
                    Gerar Automaticamente
                  </button>
                )}
              </div>
              <textarea
                placeholder="Descreva brevemente as alterações feitas no projeto..."
                value={data.lastChangeDescription || ''}
                onChange={e => onChange({ lastChangeDescription: e.target.value })}
                className="w-full bg-surface border-2 border-border/10 text-text p-4 rounded-xl focus:outline-none focus:border-accent/40 focus:bg-surface outline-none transition-all duration-500 placeholder:text-text/20 text-sm font-medium shadow-inner h-24 resize-none"
              />
            </div>
          )}

          <div className="p-8 rounded-2xl border-2 border-border/5 bg-surface shadow-lg space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
                <CheckCircle2 className="w-6 h-6 text-export-text" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Visão Geral</h3>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center shrink-0 border-2 border-border/5 group-hover:border-accent/20 transition-all duration-500">
                  <User className="w-5 h-5 text-text/30 group-hover:text-accent transition-colors" />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text/30">Cliente / Stakeholder</p>
                  <p className="text-lg font-black tracking-tight text-text/80">{data.client || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center shrink-0 border-2 border-border/5 group-hover:border-accent/20 transition-all duration-500">
                  <Target className="w-5 h-5 text-text/30 group-hover:text-accent transition-colors" />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text/30">O Quê (Produto/Serviço)</p>
                  <p className="text-sm font-medium leading-relaxed text-text/60 group-hover:text-text/80 transition-colors">{data.what || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center shrink-0 border-2 border-border/5 group-hover:border-accent/20 transition-all duration-500">
                  <HelpCircle className="w-5 h-5 text-text/30 group-hover:text-accent transition-colors" />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text/30">Porquê (Valor de Negócio)</p>
                  <p className="text-sm font-medium leading-relaxed text-text/60 group-hover:text-text/80 transition-colors">{data.why || 'Não informado'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Rules Summary */}
        {data.showBusinessRules && (
          <div className="p-8 rounded-2xl border-2 border-purple-500/10 bg-purple-500/[0.02] space-y-8 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-purple-500">Regras de Negócio</h3>
            </div>
            
            <div className="space-y-4">
              {businessRules.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-purple-500/10 rounded-2xl bg-surface/50">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500/20">Nenhuma regra definida</p>
                </div>
              ) : (
                businessRules.map((rule, i) => (
                  <div key={rule.id} className="flex gap-4 items-start p-4 rounded-xl bg-surface border-2 border-purple-500/5 group hover:border-purple-500/20 transition-all duration-500 shadow-sm">
                    <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-black text-xs shrink-0 border border-purple-500/10">{String(i + 1).padStart(2, '0')}</span>
                    <p className="text-sm font-bold leading-relaxed text-text/70 group-hover:text-text/90 transition-colors">{rule.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Project History Summary */}
        {data.projectHistory && data.projectHistory.length > 0 && (
          <div className="p-8 rounded-2xl border-2 border-border/5 bg-surface-muted/10 space-y-8 shadow-lg lg:col-span-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
                <History className="w-6 h-6 text-export-text" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Histórico de Salvamento</h3>
            </div>
            
            <div className="space-y-4">
              {data.projectHistory.slice().reverse().map((entry, i) => (
                <div key={i} className="p-4 rounded-xl bg-surface border-2 border-border/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-accent/20 transition-all duration-500 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent">
                        <Calendar className="w-3 h-3" />
                        {new Date(entry.date).toLocaleDateString()}
                        <Clock className="w-3 h-3 ml-2" />
                        {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <p className="text-sm font-bold text-text/80 mt-1">{entry.observation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text/40 bg-surface-muted px-3 py-1.5 rounded-lg border border-border/5">
                    <User className="w-3 h-3" />
                    {entry.userName || 'Usuário'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
