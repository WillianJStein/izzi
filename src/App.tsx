/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { StepsNav } from './components/StepsNav';
import { ProjectInfoForm } from './components/ProjectInfoForm';
import { RequirementsList } from './components/RequirementsList';
import { Summary } from './components/Summary';
import { ThemeToggle } from './components/ThemeToggle';
import { ProfileModal } from './components/ProfileModal';
import { ProjectData, Requirement, BusinessRule, UserProfile } from './types';
import { generatePDF } from './utils/pdfGenerator';
import { ClipboardList, MessageSquare, X, Bot, Loader2, CheckCircle2, Layout, ListChecks, FileText, Download, LogOut, FolderOpen, Save, User as UserIcon, Settings } from 'lucide-react';
import { cn } from './utils/cn';
import { useTheme } from './hooks/useTheme';
import { GeminiChat } from './components/GeminiChat';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, logout, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp, query, collection, limit, getDocs } from 'firebase/firestore';
import { Login } from './components/Login';
import { ProjectBrowser } from './components/ProjectBrowser';
import { extractTextFromPdf } from './utils/pdfParser';
import { extractProjectDataFromText } from './services/pdfExtractionService';

const INITIAL_DATA: ProjectData = {
  name: '',
  client: '',
  type: 'sistema',
  description: '',
  what: '',
  why: '',
  objectives: [],
  requirements: [],
  businessRules: [],
  showBusinessRules: false,
  stakeholders: [],
  timeline: '',
  budget: ''
};

export default function App() {
  // Estados para gerenciar o usuário e o estado de autenticação
  // States to manage the user and authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  
  // Estados para navegação por etapas e dados do projeto
  // States for step-by-step navigation and project data
  const [activeStep, setActiveStep] = useState(0);
  const [projectData, setProjectData] = useState<ProjectData>(INITIAL_DATA);
  const [projectBaseline, setProjectBaseline] = useState<ProjectData>(INITIAL_DATA);
  
  // Estados para funcionalidades auxiliares (Chat, PDF, Salvamento)
  // States for auxiliary features (Chat, PDF, Saving)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const { theme, setTheme } = useTheme();

  // Monitora mudanças no estado de autenticação (Firebase Auth)
  // Monitors changes in the authentication state (Firebase Auth)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(collection(db, 'projects'), limit(1));
          await getDocs(q);
          setIsUnauthorized(false);
          setUser(user);
        } catch (error: any) {
          if (error.message?.includes('permission-denied') || error.code === 'permission-denied') {
            setIsUnauthorized(true);
            setUser(null);
            await logout();
          } else {
            setUser(user);
          }
        }
      } else {
        setIsUnauthorized(false);
        setUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);


  // Fetch User Profile
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const profile = docSnap.data() as UserProfile;
            setUserProfile(profile);
            if (profile.themePreference) {
              setTheme(profile.themePreference);
            }
          } else {
            const initialProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || 'Usuário',
              email: user.email || '',
              themePreference: theme,
              photoURL: user.photoURL || undefined,
              updatedAt: new Date().toISOString()
            };
            await setDoc(docRef, initialProfile);
            setUserProfile(initialProfile);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      };
      fetchProfile();
    } else {
      setUserProfile(null);
    }
  }, [user, setTheme]);

  const handleSaveProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return;
    try {
      const updatedProfile = { ...userProfile, ...updates, updatedAt: new Date().toISOString() };
      await setDoc(doc(db, 'users', user.uid), updatedProfile);
      setUserProfile(updatedProfile);
      if (updates.themePreference) {
        setTheme(updates.themePreference);
      }
      setToastMessage('Perfil atualizado com sucesso!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleProjectChange = useCallback((newData: Partial<ProjectData>) => {
    setProjectData(prev => ({ ...prev, ...newData }));
  }, []);

  const handleTriggerChat = useCallback((message: string) => {
    setChatInitialMessage(message);
    setIsChatOpen(true);
  }, []);

  const handleAddRequirement = useCallback((req: Requirement) => {
    setProjectData(prev => ({
      ...prev,
      requirements: [...prev.requirements, req]
    }));
  }, []);

  const handleUpdateRequirement = useCallback((updatedReq: Requirement) => {
    setProjectData(prev => ({
      ...prev,
      requirements: prev.requirements.map(r => r.id === updatedReq.id ? updatedReq : r)
    }));
  }, []);

  const handleRemoveRequirement = useCallback((id: string) => {
    setProjectData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(r => r.id !== id)
    }));
  }, []);

  const handleAddBusinessRule = useCallback((rule: BusinessRule) => {
    setProjectData(prev => ({
      ...prev,
      businessRules: [...prev.businessRules, rule]
    }));
  }, []);

  const handleUpdateBusinessRule = useCallback((updatedRule: BusinessRule) => {
    setProjectData(prev => ({
      ...prev,
      businessRules: prev.businessRules.map(r => r.id === updatedRule.id ? updatedRule : r)
    }));
  }, []);

  const handleRemoveBusinessRule = useCallback((id: string) => {
    setProjectData(prev => ({
      ...prev,
      businessRules: prev.businessRules.filter(r => r.id !== id)
    }));
  }, []);

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generatePDF(projectData);
      setToastMessage('PDF Gerado com Sucesso!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateChangeSummary = useCallback(() => {
    if (!projectBaseline) return '';
    
    const changes: string[] = [];
    
    // Campos básicos
    if (projectData.name !== projectBaseline.name) changes.push(`Título: "${projectData.name}"`);
    if (projectData.client !== projectBaseline.client) changes.push(`Cliente: "${projectData.client}"`);
    if (projectData.type !== projectBaseline.type) changes.push(`Tipo: ${projectData.type}`);
    if (projectData.timeline !== projectBaseline.timeline) changes.push(`Prazo: ${projectData.timeline}`);
    if (projectData.budget !== projectBaseline.budget) changes.push(`Orçamento: ${projectData.budget}`);

    // Requisitos
    const addedReqs = projectData.requirements.filter(r => !projectBaseline.requirements.find(br => br.id === r.id));
    const removedReqs = projectBaseline.requirements.filter(br => !projectData.requirements.find(r => r.id === br.id));
    const modifiedReqs = projectData.requirements.filter(r => {
      const br = projectBaseline.requirements.find(b => b.id === r.id);
      return br && (
        br.title !== r.title || 
        br.description !== r.description || 
        br.priority !== r.priority || 
        br.type !== r.type
      );
    });

    if (addedReqs.length > 0) changes.push(`Novos Requisitos: ${addedReqs.map(r => r.title).join(', ')}`);
    if (removedReqs.length > 0) changes.push(`Requisitos Removidos: ${removedReqs.map(r => r.title).join(', ')}`);
    if (modifiedReqs.length > 0) {
      const details = modifiedReqs.map(r => {
        const lastEntry = r.history?.[r.history.length - 1];
        const prefix = r.type === 'funcional' ? 'RF' : 'RNF';
        // Encontrar o índice real no PDF (isso é complexo aqui, então usamos o título)
        return `${r.title}${lastEntry?.observation ? ` (${lastEntry.observation})` : ''}`;
      }).join('; ');
      changes.push(`Ajustes: ${details}`);
    }

    // Regras de Negócio
    const addedBR = projectData.businessRules.filter(r => !projectBaseline.businessRules.find(br => br.id === r.id));
    const removedBR = projectBaseline.businessRules.filter(br => !projectData.businessRules.find(r => r.id === br.id));
    const modifiedBR = projectData.businessRules.filter(r => {
      const br = projectBaseline.businessRules.find(b => b.id === r.id);
      return br && br.description !== r.description;
    });

    if (addedBR.length > 0) changes.push(`Novas Regras de Negócio: ${addedBR.length} item(s)`);
    if (removedBR.length > 0) changes.push(`Regras de Negócio Removidas: ${removedBR.length} item(s)`);
    if (modifiedBR.length > 0) changes.push(`Ajuste de escrita em Regras de Negócio: ${modifiedBR.length} item(s)`);

    return changes.length > 0 ? changes.join('. ') : 'Salvamento sem alterações significativas';
  }, [projectData, projectBaseline]);

  const handleSaveProject = async () => {
    if (!user || !projectData.name) return;
    setIsSaving(true);
    try {
      const projectId = projectData.id || crypto.randomUUID();
      const now = new Date().toISOString();
      const userName = userProfile?.displayName || user.displayName || user.email || 'Usuário';
      
      const autoSummary = generateChangeSummary();
      const observation = projectData.lastChangeDescription || autoSummary || 'Salvamento do projeto';

      const projectToSave = {
        ...projectData,
        id: projectId,
        ownerUid: user.uid,
        createdAt: projectData.createdAt || now,
        updatedAt: now,
        updatedBy: userName,
        lastChangeDescription: observation,
        projectHistory: [
          ...(projectData.projectHistory || []),
          {
            date: now,
            observation: observation,
            userName: userName
          }
        ]
      };
      
      await setDoc(doc(db, 'projects', projectId), projectToSave);
      setProjectData(projectToSave);
      setProjectBaseline(projectToSave);
      setToastMessage('Projeto Salvo com Sucesso!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `projects/${projectData.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadProject = (project: ProjectData) => {
    const normalized = {
      ...project,
      requirements: Array.isArray(project.requirements) ? project.requirements : [],
      businessRules: Array.isArray(project.businessRules) ? project.businessRules : [],
      objectives: Array.isArray(project.objectives) ? project.objectives : [],
      stakeholders: Array.isArray(project.stakeholders) ? project.stakeholders : []
    };
    setProjectData(normalized);
    setProjectBaseline(normalized);
    setIsBrowserOpen(false);
    setActiveStep(0);
  };

  const handleNewProject = () => {
    setProjectData(INITIAL_DATA);
    setProjectBaseline(INITIAL_DATA);
    setIsBrowserOpen(false);
    setActiveStep(0);
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtractingPdf(true);
    try {
      const text = await extractTextFromPdf(file);
      const extractedData = await extractProjectDataFromText(text);
      
      setProjectData(prev => ({
        ...prev,
        ...extractedData,
        requirements: [
          ...prev.requirements,
          ...(extractedData.requirements || [])
        ],
        businessRules: [
          ...prev.businessRules,
          ...(extractedData.businessRules || [])
        ]
      }));

      setToastMessage('PDF Importado com Sucesso!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      setActiveStep(0); // Go to first step to see imported data
    } catch (error) {
      console.error('Erro ao importar PDF:', error);
      setToastMessage('Erro ao importar PDF. Tente novamente.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } finally {
      setIsExtractingPdf(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleApplySuggestion = useCallback((field: string, value: any) => {
    const userName = userProfile?.displayName || user?.displayName || user?.email || 'Usuário';
    if (field === 'requirement' && typeof value === 'object') {
      handleAddRequirement({
        id: crypto.randomUUID(),
        title: value.title || 'Novo Requisito',
        description: value.description || '',
        priority: value.priority || 'média',
        type: value.type || 'funcional',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [{ 
          date: new Date().toISOString(), 
          observation: 'Requisito sugerido e adicionado',
          userName: userName
        }]
      });
    } else if (field === 'businessRules' && Array.isArray(value)) {
      value.forEach(ruleDesc => {
        handleAddBusinessRule({
          id: crypto.randomUUID(),
          description: ruleDesc
        });
      });
    } else {
      handleProjectChange({ [field]: value });
    }
  }, [handleAddRequirement, handleAddBusinessRule, handleProjectChange, user, userProfile]);

  const isComplete = projectData.name && projectData.requirements.length > 0;

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login isUnauthorized={isUnauthorized} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text selection:bg-accent/30 pb-24 lg:pb-0">
      {/* Header */}
      <header className="w-full glass-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-accent/40 overflow-hidden border border-white/20">
              <img 
                src={theme === 'dark' ? '/images/icon_white.png' : '/images/icon_black.png'} 
                alt="izi" 
                className="w-8 h-8 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-black tracking-tighter leading-none bg-gradient-to-br from-text to-text/60 bg-clip-text text-transparent">izi</h1>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-text/40 mt-1.5">Levantamento Requisitos 2026</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2">
              <label className="p-2.5 hover:bg-surface-muted rounded-xl transition-all text-text/40 hover:text-accent cursor-pointer group" title="Importar PDF">
                <FileText className="w-5 h-5" />
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setIsBrowserOpen(true)}
                className="p-2.5 hover:bg-surface-muted rounded-xl transition-all text-text/40 hover:text-accent group"
                title="Abrir Projetos"
              >
                <FolderOpen className="w-5 h-5" />
              </button>
              <button
                onClick={handleSaveProject}
                disabled={!projectData.name || isSaving}
                className="p-2.5 hover:bg-surface-muted rounded-xl transition-all text-text/40 hover:text-accent disabled:opacity-20 group"
                title="Salvar Projeto"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              </button>
            </div>

            <div className="h-8 w-px bg-border/50 mx-2 hidden md:block" />

            <ThemeToggle />
            <div className="h-8 w-px bg-border/50 mx-2" />
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:block">
                <span className="text-[10px] font-black uppercase tracking-widest text-text/60">{userProfile?.displayName || user.displayName}</span>
                <div className="flex gap-2">
                  <button onClick={() => setIsProfileOpen(true)} className="text-[8px] font-bold uppercase tracking-widest text-accent/60 hover:text-accent transition-colors">Perfil</button>
                  <span className="text-[8px] text-text/20">•</span>
                  <button onClick={logout} className="text-[8px] font-bold uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors">Sair</button>
                </div>
              </div>
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center overflow-hidden border border-accent/20 hover:border-accent/40 transition-all group"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <UserIcon className="w-5 h-5 text-accent" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col gap-8 sm:gap-12">
          <div className="hidden lg:block w-full">
            <StepsNav 
              activeStep={activeStep} 
              onStepChange={setActiveStep} 
              onGeneratePDF={handleGeneratePDF}
              projectData={projectData}
            />
          </div>

          <div className="flex-1 min-w-0 w-full">
            <motion.div 
              layout
              className="glass-card rounded-[32px] p-6 sm:p-10"
            >
              <div className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4 tracking-tight">
                  {activeStep === 0 && "Informações do Projeto"}
                  {activeStep === 1 && "Levantamento de Requisitos"}
                  {activeStep === 2 && "Resumo do Levantamento"}
                </h2>
                <p className="text-sm sm:text-base text-text/40 font-medium leading-relaxed max-w-xl">
                  {activeStep === 0 && "Defina a fundação estratégica do seu novo projeto."}
                  {activeStep === 1 && "Mapeie as funcionalidades e restrições técnicas."}
                  {activeStep === 2 && "Valide a consistência antes da exportação."}
                </p>
              </div>

              <div className="min-h-[400px]">
                {activeStep === 0 && (
                  <ProjectInfoForm 
                    data={projectData} 
                    onChange={handleProjectChange} 
                    onTriggerChat={handleTriggerChat}
                    onPdfUpload={handlePdfUpload}
                  />
                )}
                {activeStep === 1 && (
                  <RequirementsList 
                    requirements={projectData.requirements} 
                    businessRules={projectData.businessRules}
                    showBusinessRules={projectData.showBusinessRules}
                    onAdd={handleAddRequirement} 
                    onUpdate={handleUpdateRequirement}
                    onRemove={handleRemoveRequirement} 
                    onAddBusinessRule={handleAddBusinessRule}
                    onUpdateBusinessRule={handleUpdateBusinessRule}
                    onRemoveBusinessRule={handleRemoveBusinessRule}
                    onToggleBusinessRules={(show) => handleProjectChange({ showBusinessRules: show })}
                    onTriggerChat={handleTriggerChat}
                    userName={user?.displayName || user?.email || 'Usuário'}
                  />
                )}
                {activeStep === 2 && (
                  <Summary 
                    data={projectData} 
                    onChange={handleProjectChange} 
                    onGenerateSummary={generateChangeSummary}
                  />
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="mt-12 flex justify-end items-center gap-6">
                <button
                  onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                  disabled={activeStep === 0}
                  className="px-8 py-3.5 rounded-xl font-bold border-2 border-border/10 bg-surface-muted text-text/30 hover:text-text hover:border-accent/40 hover:bg-accent/5 disabled:opacity-0 transition-all duration-500 uppercase tracking-widest text-[10px]"
                >
                  Voltar
                </button>
                
                {activeStep < 2 && (
                  <button
                    onClick={() => setActiveStep(prev => Math.min(2, prev + 1))}
                    className="px-10 py-3.5 bg-accent text-export-text rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-accent-focus shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all duration-500 hover:-translate-y-0.5 active:scale-95"
                  >
                    Continuar
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navbar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass-header border-t border-b-0 z-50 px-8 py-6 flex items-center justify-around shadow-[0_-20px_60px_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => setActiveStep(0)}
          className={cn(
            "flex flex-col items-center gap-2 transition-all duration-500",
            activeStep === 0 ? "text-accent scale-110" : "text-text/20"
          )}
        >
          <Layout className="w-7 h-7" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Info</span>
        </button>
        <button 
          onClick={() => setActiveStep(1)}
          className={cn(
            "flex flex-col items-center gap-2 transition-all duration-500",
            activeStep === 1 ? "text-accent scale-110" : "text-text/20"
          )}
        >
          <ListChecks className="w-7 h-7" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Reqs</span>
        </button>
        <button 
          onClick={() => setActiveStep(2)}
          className={cn(
            "flex flex-col items-center gap-2 transition-all duration-500",
            activeStep === 2 ? "text-accent scale-110" : "text-text/20"
          )}
        >
          <FileText className="w-7 h-7" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Resumo</span>
        </button>
        <div className="w-px h-10 bg-border/30 mx-2" />
        <button 
          onClick={handleGeneratePDF}
          disabled={!isComplete}
          className={cn(
            "flex flex-col items-center gap-2 transition-all duration-500",
            isComplete ? "text-accent" : "text-text/5"
          )}
        >
          <Download className="w-7 h-7" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">PDF</span>
        </button>
      </nav>

      {/* Floating Chat Button */}
      <div className="fixed bottom-28 lg:bottom-10 right-8 lg:right-12 flex flex-col items-end gap-5 z-50">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={cn(
            "w-16 h-16 rounded-[28px] flex items-center justify-center shadow-2xl transition-all duration-300 group relative overflow-hidden",
            isChatOpen ? "bg-surface border-2 border-border text-accent" : "bg-accent text-white hover:scale-110 hover:shadow-accent/30"
          )}
        >
          <div className={cn("absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity")} />
          {isChatOpen ? <X className="w-8 h-8" /> : (
            <div className="relative">
              <MessageSquare className="w-8 h-8" />
              <div className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Bot className="w-3 h-3 text-accent" />
              </div>
            </div>
          )}
        </button>
      </div>

      <GeminiChat 
        isOpen={isChatOpen} 
        onClose={() => {
          setIsChatOpen(false);
          setChatInitialMessage('');
        }} 
        projectContext={projectData}
        initialMessage={chatInitialMessage}
        onApplySuggestion={handleApplySuggestion}
      />

      {/* PDF Loading Overlay */}
      <AnimatePresence>
        {(isGeneratingPDF || isExtractingPdf) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <div className="bg-surface p-8 rounded-[32px] border border-border shadow-2xl flex flex-col items-center gap-6 max-w-xs w-full text-center">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-accent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-accent/40" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight mb-2">
                  {isGeneratingPDF ? "Gerando PDF" : "Analisando PDF"}
                </h3>
                <p className="text-sm opacity-60 font-medium">
                  {isGeneratingPDF 
                    ? "Estamos preparando seu relatório premium. Por favor, aguarde..."
                    : "A izi está lendo seu documento para preencher o projeto automaticamente..."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <CheckCircle2 className="w-6 h-6" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Browser */}
      <AnimatePresence>
        {isBrowserOpen && (
          <ProjectBrowser
            onLoadProject={handleLoadProject}
            onNewProject={handleNewProject}
            onClose={() => setIsBrowserOpen(false)}
          />
        )}
      </AnimatePresence>

      {isProfileOpen && userProfile && (
        <ProfileModal 
          profile={userProfile} 
          onSave={handleSaveProfile} 
          onClose={() => setIsProfileOpen(false)} 
        />
      )}

      {/* Footer */}
      <footer className="py-8 opacity-20 text-center text-[10px] font-bold uppercase tracking-[0.2em]">
        izi 2026 &copy; Professional Requirements Gathering System | By: BASEU
      </footer>
    </div>
  );
}
