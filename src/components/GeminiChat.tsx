import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Loader2, Sparkles, RotateCcw, Check, Copy, Edit2, Eraser, Zap, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../utils/cn';

interface Message {
  role: 'user' | 'model';
  text: string;
  suggestion?: {
    field: string;
    value: any;
  };
}

interface GeminiChatProps {
  isOpen: boolean;
  onClose: () => void;
  projectContext: any;
  initialMessage?: string;
  onApplySuggestion: (field: string, value: any) => void;
}

export const GeminiChat: React.FC<GeminiChatProps> = ({ 
  isOpen, 
  onClose, 
  projectContext, 
  initialMessage,
  onApplySuggestion 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou seu assistente izi. Como posso ajudar no levantamento de requisitos hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepMode, setIsDeepMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle initial message
  useEffect(() => {
    if (isOpen && initialMessage) {
      handleSend(initialMessage);
    }
  }, [isOpen, initialMessage]);

  const handleNewChat = () => {
    setMessages([{ role: 'model', text: 'Nova conversa iniciada. Como posso ajudar?' }]);
    setInput('');
  };

  const parseSuggestion = (text: string): { cleanText: string, suggestion?: { field: string, value: any } } => {
    const suggestionRegex = /\[SUGGESTION:(\w+)\]([\s\S]*?)\[\/SUGGESTION\]/;
    const match = text.match(suggestionRegex);
    
    if (match) {
      const field = match[1];
      let value = match[2].trim();
      
      // Try to parse as JSON if it looks like it
      if (value.startsWith('{') || value.startsWith('[')) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.error("Failed to parse suggestion JSON", e);
        }
      }

      const cleanText = text.replace(suggestionRegex, '').trim();
      return { cleanText, suggestion: { field, value } };
    }
    
    return { cleanText: text };
  };

  // Função para enviar mensagem para a IA através do nosso proxy backend
  // Function to send a message to the AI through our backend proxy
  const handleSend = async (overrideInput?: string) => {
    const messageText = overrideInput || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage = messageText.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Fazemos a chamada para o nosso próprio backend para manter a chave de API segura
      // We call our own backend to keep the API key secure
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          projectContext,
          isDeepMode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na requisição');
      }

      const data = await response.json();
      const rawText = data.text;

      if (rawText) {
        // Processa a resposta para procurar por sugestões estruturadas
        // Processes the response to look for structured suggestions
        const { cleanText, suggestion } = parseSuggestion(rawText);
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: cleanText || 'Aqui está minha sugestão:', 
          suggestion 
        }]);
      }
    } catch (error) {
      console.error('Gemini Error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Desculpe, ocorreu um erro ao processar sua solicitação.' }]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          className="fixed bottom-0 right-0 sm:bottom-20 sm:right-6 w-full sm:w-[400px] h-full sm:h-[600px] bg-surface/90 backdrop-blur-3xl border-l sm:border-2 border-border/10 sm:rounded-3xl shadow-2xl flex flex-col z-[60] overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500"
        >
          {/* Header */}
          <div className="p-5 border-b border-border/5 bg-surface/40 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/30 group">
                <Bot className="w-4.5 h-4.5 text-export-text group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div>
                <h3 className="font-black text-base tracking-tight leading-none mb-1">Assistente izi</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-[0.1em] opacity-30">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handleNewChat}
                className="w-8 h-8 flex items-center justify-center hover:bg-surface-muted rounded-lg transition-colors duration-300 text-text/30 hover:text-accent group"
                title="Nova Conversa"
              >
                <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500 ease-in-out" />
              </button>
              <button 
                onClick={onClose} 
                className="w-8 h-8 flex items-center justify-center hover:bg-surface-muted rounded-lg transition-colors duration-300 text-text/30 hover:text-red-500" 
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex flex-col gap-1.5", m.role === 'user' ? "items-end" : "items-start")}>
                <div className={cn("flex gap-2.5", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    m.role === 'user' ? "bg-accent/10 text-accent" : "bg-surface-muted text-text/40"
                  )}>
                    {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div className={cn(
                    "max-w-[85%] p-3 rounded-xl text-xs leading-relaxed shadow-sm",
                    m.role === 'user' 
                      ? "bg-accent text-white rounded-tr-none font-medium" 
                      : "bg-surface-muted text-text rounded-tl-none font-medium border border-border/10"
                  )}>
                    <div className={cn(
                      "prose prose-sm max-w-none dark:prose-invert",
                      m.role === 'user' ? "prose-p:text-white prose-headings:text-white" : "prose-p:text-text prose-headings:text-text"
                    )}>
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                    
                    {m.suggestion && (
                      <div className="mt-3 p-3 bg-surface rounded-lg border border-accent/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-widest text-accent">Sugestão: {m.suggestion.field}</span>
                          <Sparkles className="w-2.5 h-2.5 text-accent" />
                        </div>
                        
                        {editingIndex === i ? (
                          <textarea
                            value={typeof editingValue === 'string' ? editingValue : JSON.stringify(editingValue, null, 2)}
                            onChange={(e) => {
                              const val = e.target.value;
                              try {
                                if (val.startsWith('{') || val.startsWith('[')) {
                                  setEditingValue(JSON.parse(val));
                                } else {
                                  setEditingValue(val);
                                }
                              } catch (err) {
                                setEditingValue(val);
                              }
                            }}
                            className="w-full p-2 text-[11px] bg-surface-muted border border-accent/30 rounded-md focus:outline-none focus:ring-1 focus:ring-accent/20 resize-none min-h-[80px] leading-relaxed"
                          />
                        ) : (
                          <div className="text-[11px] text-text/80 italic leading-relaxed">
                            {m.suggestion.field === 'requirement' ? (
                              <div className="space-y-1 bg-surface-muted/30 p-2 rounded-lg border border-border/5">
                                <p><strong>Título:</strong> {m.suggestion.value.title}</p>
                                <p><strong>Tipo:</strong> {m.suggestion.value.type}</p>
                                <p><strong>Prioridade:</strong> {m.suggestion.value.priority}</p>
                                <p><strong>Descrição:</strong> {m.suggestion.value.description}</p>
                              </div>
                            ) : m.suggestion.field === 'businessRules' ? (
                              <ul className="list-disc pl-4 space-y-1">
                                {m.suggestion.value.map((rule: string, idx: number) => (
                                  <li key={idx}>{rule}</li>
                                ))}
                              </ul>
                            ) : (
                              <p>"{m.suggestion.value}"</p>
                            )}
                          </div>
                        )}
                        
                        <div className="flex gap-1.5">
                          {editingIndex === i ? (
                            <>
                              <button
                                onClick={() => {
                                  onApplySuggestion(m.suggestion!.field, editingValue);
                                  setMessages(prev => [...prev, { role: 'model', text: `Sugestão editada e aplicada ao campo "${m.suggestion!.field}" com sucesso!` }]);
                                  setEditingIndex(null);
                                }}
                                className="flex-1 py-1.5 bg-accent text-white rounded-md text-[10px] font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-all"
                              >
                                <Check className="w-2.5 h-2.5" />
                                Aplicar
                              </button>
                              <button
                                onClick={() => setEditingIndex(null)}
                                className="px-2 py-1.5 border border-border rounded-md text-[10px] font-bold hover:bg-text/5 transition-all"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  onApplySuggestion(m.suggestion!.field, m.suggestion!.value);
                                  setMessages(prev => [...prev, { role: 'model', text: `Sugestão aplicada ao campo "${m.suggestion!.field}" com sucesso!` }]);
                                }}
                                className="flex-1 py-1.5 bg-accent text-white rounded-md text-[10px] font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-all"
                              >
                                <Check className="w-2.5 h-2.5" />
                                Aplicar
                              </button>
                              <button
                                onClick={() => {
                                  setEditingIndex(i);
                                  setEditingValue(m.suggestion!.value);
                                }}
                                className="px-2 py-1.5 border border-accent/30 text-accent rounded-md text-[10px] font-bold hover:bg-accent/5 transition-all flex items-center gap-1"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                                Editar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-surface-muted flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
                </div>
                <div className="bg-surface-muted p-3 rounded-xl rounded-tl-none border border-border/10">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-accent/40 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-accent/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-accent/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-border/5 bg-surface/60 backdrop-blur-3xl">
            <div className="relative group">
              <textarea
                rows={1}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Como posso ajudar?"
                className="w-full p-4 pr-16 rounded-2xl bg-surface-muted/50 border border-border/5 focus:border-accent/30 focus:bg-surface focus:ring-4 focus:ring-accent/5 outline-none transition-all duration-500 text-sm font-medium resize-none min-h-[56px] max-h-32 scrollbar-hide shadow-inner"
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-2">
                {input && (
                  <button
                    onClick={() => setInput('')}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-text/20 hover:text-red-500 hover:bg-red-500/10 transition-all duration-500"
                  >
                    <Eraser className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg",
                    input.trim() && !isLoading 
                      ? "bg-accent text-export-text shadow-accent/40 hover:scale-105 active:scale-95" 
                      : "bg-surface-muted text-text/10 shadow-none cursor-not-allowed"
                  )}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mb-3">
              <button 
                onClick={() => setIsDeepMode(!isDeepMode)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-300",
                  isDeepMode 
                    ? "bg-accent/10 border-accent/30 text-accent" 
                    : "bg-surface-muted border-border/10 text-text/30"
                )}
              >
                {isDeepMode ? <Brain className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                <span className="text-[8px] font-black uppercase tracking-widest">
                  {isDeepMode ? "Modo Deep" : "Modo Fast"}
                </span>
              </button>
            </div>
            <div className="text-[8px] text-center opacity-20 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
              <div className="w-1 h-1 rounded-full bg-accent/40" />
              Powered by {isDeepMode ? "Gemini 1.5 Pro" : "Gemini 1.5 Flash"}
              <div className="w-1 h-1 rounded-full bg-accent/40" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
