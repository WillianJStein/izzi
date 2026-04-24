import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProjectData } from '../types';

export const generatePDF = async (project: ProjectData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper for colors
  const colors: { [key: string]: [number, number, number] } = {
    primary: [36, 42, 53],
    accent: [147, 51, 234],
    text: [60, 60, 60],
    lightText: [120, 120, 120],
    border: [230, 230, 230]
  };

  // Header Background
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Logo / Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('izi', 14, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Levantamento de Requisitos Profissional', 14, 30);

  // Date on the right
  doc.setFontSize(9);
  doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, pageWidth - 14, 25, { align: 'right' });

  let currentY = 55;

  const requirements = Array.isArray(project.requirements) ? project.requirements : [];
  const businessRules = Array.isArray(project.businessRules) ? project.businessRules : [];

  // Project Title Section
  doc.setFontSize(22);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  const splitTitle = doc.splitTextToSize(project.name || 'Projeto sem nome', pageWidth - 28);
  doc.text(splitTitle, 14, currentY);
  currentY += (splitTitle.length * 10) + 2;

  doc.setFontSize(12);
  doc.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(`Cliente: ${project.client || 'Não informado'}`, 14, currentY);
  currentY += 15;

  // Last Modified Info in PDF
  if (project.updatedAt) {
    doc.setFontSize(8);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('ÚLTIMA ATUALIZAÇÃO:', 14, currentY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    const updateInfo = `${new Date(project.updatedAt).toLocaleString('pt-BR')} por ${project.updatedBy || 'Usuário'}`;
    doc.text(updateInfo, 48, currentY);
    currentY += 5;

    if (project.lastChangeDescription) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.text('O QUE MUDOU:', 14, currentY);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      const splitChange = doc.splitTextToSize(project.lastChangeDescription, pageWidth - 48);
      doc.text(splitChange, 48, currentY);
      currentY += (splitChange.length * 4) + 5;
    }
    currentY += 5;
  }

  // Horizontal Line
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 15;

  // Info Grid
  const infoItems = [
    { label: 'TIPO DE PROJETO', value: project.type.toUpperCase() },
    { label: 'CRONOGRAMA', value: project.timeline || 'Não definido' },
    { label: 'ORÇAMENTO', value: project.budget || 'Não definido' }
  ];

  infoItems.forEach((item, i) => {
    const x = 14 + (i * (pageWidth - 28) / 3);
    doc.setFontSize(8);
    doc.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(item.label, x, currentY);
    
    doc.setFontSize(10);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(item.value, x, currentY + 6);
  });

  currentY += 25;

  // What and Why Sections
  const addSection = (title: string, content: string) => {
    if (!content) return;
    
    // Check for page break
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 14, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(content, pageWidth - 28);
    doc.text(splitText, 14, currentY);
    currentY += (splitText.length * 5) + 12;
  };

  addSection('O Quê (Produto/Serviço)', project.what);
  addSection('Porquê (Valor de Negócio)', project.why);
  addSection('Descrição Geral', project.description);

  // Business Rules
  if (project.showBusinessRules && businessRules.length > 0) {
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('REGRAS DE NEGÓCIO (RN)', 14, currentY);
    currentY += 5;

    const brData = businessRules.map((br, i) => [
      `RN${(i + 1).toString().padStart(2, '0')}`,
      br.description
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['ID', 'Descrição']],
      body: brData,
      theme: 'grid',
      headStyles: { 
        fillColor: colors.accent, 
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: { 
        fontSize: 9,
        cellPadding: 5,
        lineColor: colors.border,
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'bold' }
      }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  // Requirements
  if (requirements.length > 0) {
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('REQUISITOS DETALHADOS', 14, currentY);
    currentY += 5;

    // Sort and format IDs
    const sortedRequirements = [...requirements].sort((a, b) => {
      if (a.type === b.type) return 0;
      return a.type === 'funcional' ? -1 : 1;
    });

    const reqData = sortedRequirements.map((req) => {
      const prefix = req.type === 'funcional' ? 'RF' : 'RNF';
      const typeIndex = sortedRequirements
        .filter(r => r.type === req.type)
        .findIndex(r => r.id === req.id) + 1;
      const id = `${prefix}${typeIndex.toString().padStart(2, '0')}`;
      
      return [
        id,
        req.title,
        req.type === 'funcional' ? 'Funcional' : 'Não Funcional',
        req.priority.toUpperCase(),
        req.description
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['ID', 'Título', 'Tipo', 'Prioridade', 'Descrição']],
      body: reqData,
      theme: 'grid',
      headStyles: { 
        fillColor: colors.primary, 
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: { 
        fontSize: 8,
        cellPadding: 4,
        lineColor: colors.border,
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'bold' },
        1: { cellWidth: 35, fontStyle: 'bold' },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 'auto' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // Revision History Section
    const historyData: any[] = [];
    sortedRequirements.forEach((req) => {
      const prefix = req.type === 'funcional' ? 'RF' : 'RNF';
      const typeIndex = sortedRequirements
        .filter(r => r.type === req.type)
        .findIndex(r => r.id === req.id) + 1;
      const id = `${prefix}${typeIndex.toString().padStart(2, '0')}`;

      if (req.history && req.history.length > 0) {
        req.history.forEach((entry) => {
          historyData.push([
            id,
            new Date(entry.date).toLocaleDateString(),
            new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            entry.userName || 'Usuário',
            entry.observation
          ]);
        });
      }
    });

    if (historyData.length > 0) {
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('HISTÓRICO DE REVISÕES DOS REQUISITOS', 14, currentY);
      currentY += 5;

      autoTable(doc, {
        startY: currentY,
        head: [['ID', 'Data', 'Hora', 'Usuário', 'Observação da Alteração']],
        body: historyData,
        theme: 'grid',
        headStyles: { 
          fillColor: colors.accent, 
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        styles: { 
          fontSize: 8,
          cellPadding: 4,
          lineColor: colors.border,
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 20, fontStyle: 'bold' },
          1: { cellWidth: 25 },
          2: { cellWidth: 20 },
          3: { cellWidth: 30 },
          4: { cellWidth: 'auto' }
        }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Project History Section
    if (project.projectHistory && project.projectHistory.length > 0) {
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('HISTÓRICO DE SALVAMENTO DO PROJETO', 14, currentY);
      currentY += 5;

      const projectHistoryData = project.projectHistory.map(entry => [
        new Date(entry.date).toLocaleDateString(),
        new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        entry.userName || 'Usuário',
        entry.observation
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Data', 'Hora', 'Usuário', 'O que mudou']],
        body: projectHistoryData,
        theme: 'grid',
        headStyles: { 
          fillColor: colors.primary, 
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        styles: { 
          fontSize: 8,
          cellPadding: 4,
          lineColor: colors.border,
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 20 },
          2: { cellWidth: 35 },
          3: { cellWidth: 'auto' }
        }
      });
    }
  }

  // Footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
    doc.text(
      `izi Requirements - Documento de Levantamento de Requisitos | Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Simulate generation time for feedback
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  doc.save(`${project.name.replace(/\s+/g, '_')}_requisitos.pdf`);
};
