import { ProjectData } from "../types";

// Função para extrair dados estruturados do projeto a partir de texto de um PDF
// Function to extract structured project data from PDF text
export const extractProjectDataFromText = async (text: string): Promise<Partial<ProjectData>> => {
  // Chamada para o nosso proxy backend para processar o texto com a IA
  // Call to our backend proxy to process the text with AI
  const response = await fetch('/api/extract-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro na extração de PDF');
  }

  const data = await response.json();
  
  try {
    // A IA retorna o JSON estruturado dentro da propriedade 'text'
    // AI returns the structured JSON inside the 'text' property
    const extractedData = JSON.parse(data.text);
    
    // Mapeia os requisitos para incluir IDs únicos e histórico inicial
    // Maps requirements to include unique IDs and initial history
    if (extractedData.requirements) {
      extractedData.requirements = extractedData.requirements.map((req: any) => ({
        ...req,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [{
          date: new Date().toISOString(),
          observation: 'Importado via PDF',
          userName: 'Sistema'
        }]
      }));
    }

    // Mapeia as regras de negócio para incluir IDs únicos
    // Maps business rules to include unique IDs
    if (extractedData.businessRules) {
      extractedData.businessRules = extractedData.businessRules.map((rule: string) => ({
        id: crypto.randomUUID(),
        description: rule
      }));
    }

    return extractedData;
  } catch (error) {
    console.error("Erro ao processar JSON do Gemini:", error);
    return {};
  }
};

