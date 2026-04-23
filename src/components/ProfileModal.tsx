import React, { useState } from 'react';
import { User, Mail, Save, X, Monitor, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, Theme } from '../types';
import { cn } from '../utils/cn';

interface ProfileModalProps {
  profile: UserProfile;
  onSave: (updates: Partial<UserProfile>) => Promise<void>;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ profile, onSave, onClose }) => {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [themePreference, setThemePreference] = useState<Theme>(profile.themePreference);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ displayName, themePreference });
      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-surface w-full max-w-md rounded-[32px] border border-border shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between bg-surface/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <User className="w-5 h-5 text-export-text" />
            </div>
            <h2 className="text-xl font-black tracking-tight">Meu Perfil</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-muted rounded-xl transition-all">
            <X className="w-6 h-6 text-text/40" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text/40 ml-1">Nome de Exibição</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text/20 group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full bg-surface-muted border-2 border-border/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-accent/40 transition-all"
                placeholder="Seu nome"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text/40 ml-1">E-mail</label>
            <div className="relative opacity-50">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text/20" />
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full bg-surface-muted border-2 border-border/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-text/40 ml-1">Preferência de Tema</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'system', icon: Monitor, label: 'Sistema' },
                { id: 'light', icon: Sun, label: 'Claro' },
                { id: 'dark', icon: Moon, label: 'Escuro' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setThemePreference(t.id as Theme)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300",
                    themePreference === t.id 
                      ? "bg-accent/10 border-accent text-accent shadow-lg shadow-accent/10" 
                      : "bg-surface-muted border-border/5 text-text/40 hover:border-accent/20"
                  )}
                >
                  <t.icon className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-surface-muted/50 border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-text/40 hover:text-text transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 bg-accent text-export-text rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-export-text/30 border-t-export-text rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar Alterações
          </button>
        </div>
      </motion.div>
    </div>
  );
};
