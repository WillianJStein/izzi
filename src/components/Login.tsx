import React from 'react';
import { signInWithGoogle } from '../firebase';
import { Bot, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  isUnauthorized?: boolean;
}

export const Login: React.FC<LoginProps> = ({ isUnauthorized }) => {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-surface p-8 rounded-[32px] border border-border shadow-2xl text-center space-y-8"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center shadow-xl shadow-accent/20">
            <Bot className="w-10 h-10 text-export-text" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">izi Assistant</h1>
            <p className="text-sm font-medium text-text/20 uppercase tracking-widest mt-2">Levantamento de Requisitos Profissional</p>
          </div>
        </div>

        <div className="space-y-4">
          {isUnauthorized ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <p className="text-red-500 font-bold text-sm">Acesso Negado</p>
              <p className="text-red-500/60 text-xs mt-1">Este sistema é restrito apenas a usuários autorizados.</p>
            </div>
          ) : (
            <p className="text-text/60 leading-relaxed">
              Conecte-se para salvar seus projetos, manter o histórico de requisitos e colaborar com a IA.
            </p>
          )}
          
          <button
            onClick={handleLogin}
            className="w-full py-4 bg-accent text-export-text rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-accent-focus transition-all duration-300 shadow-lg shadow-accent/20"
          >
            <LogIn className="w-5 h-5" />
            {isUnauthorized ? 'Tentar com outra conta' : 'Entrar com Google'}
          </button>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-text/20">
          izi 2026 &copy; Professional Requirements Gathering System
        </p>
      </motion.div>
    </div>
  );
};
