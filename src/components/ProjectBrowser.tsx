import React, { useEffect, useState } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ProjectData } from '../types';
import { ClipboardList, Trash2, Calendar, User, Search, Loader2, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';

interface ProjectBrowserProps {
  onLoadProject: (project: ProjectData) => void;
  onNewProject: () => void;
  onClose: () => void;
}

export const ProjectBrowser: React.FC<ProjectBrowserProps> = ({ onLoadProject, onNewProject, onClose }) => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      if (!auth.currentUser) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'projects'),
          orderBy('updatedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedProjects: ProjectData[] = [];
        querySnapshot.forEach((doc) => {
          fetchedProjects.push({ ...doc.data(), id: doc.id } as ProjectData);
        });
        setProjects(fetchedProjects);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;
    
    try {
      await deleteDoc(doc(db, 'projects', id));
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-surface w-full max-w-4xl max-h-[80vh] rounded-[32px] border border-border shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-surface/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <ClipboardList className="w-5 h-5 text-export-text" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Meus Projetos</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text/40">Histórico de Levantamentos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onNewProject}
              className="px-4 py-2 bg-accent text-export-text rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-accent-focus transition-all shadow-lg shadow-accent/10"
            >
              <Plus className="w-4 h-4" />
              Novo Projeto
            </button>
            <button onClick={onClose} className="p-2 hover:bg-surface-muted rounded-xl transition-all text-text/40 hover:text-text">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-border bg-surface-muted/30">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text/20" />
            <input
              type="text"
              placeholder="Buscar por nome do projeto ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border-2 border-border/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-accent/40 transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-bold uppercase tracking-widest text-xs">Carregando projetos...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20 py-20">
              <ClipboardList className="w-16 h-16" />
              <p className="text-xl font-black uppercase tracking-widest">Nenhum projeto encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -4 }}
                  onClick={() => onLoadProject(project)}
                  className="p-5 rounded-2xl border-2 border-border/5 bg-surface-muted/20 hover:border-accent/20 hover:bg-surface transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent/5 group-hover:bg-accent transition-all" />
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h3 className="font-black text-lg tracking-tight group-hover:text-accent transition-colors">{project.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text/40">
                        <User className="w-3 h-3" />
                        {project.client}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, project.id!)}
                      className="p-2 text-text/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text/30">
                      <Calendar className="w-3 h-3" />
                      {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Sem data'}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-accent/5 text-accent border border-accent/10">
                      {project.requirements.length} Requisitos
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
