import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import path from "path";
import fs from "fs";

// Inicializa o servidor Express e as rotas da API
// Initializes the Express server and API routes
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware para processar JSON com limite de tamanho aumentado para PDFs longos
  // Middleware to process JSON with increased size limit for long PDFs
  app.use(express.json({ limit: '10mb' }));

  // Função auxiliar para obter a chave da API do Gemini de forma segura
  // Helper function to safely retrieve the Gemini API key
  const getGeminiKey = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    return key;
  };

  // Rota da API para o Chat da IA
  // API Route for the AI Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, projectContext, isDeepMode } = req.body;
      const apiKey = getGeminiKey();
      const ai = new GoogleGenAI({ apiKey });
      
      const modelName = isDeepMode ? "gemini-2.0-flash-thinking-exp-01-21" : "gemini-2.0-flash";
      
      const chat = ai.chats.create({
        model: modelName,
        config: {
          systemInstruction: `Você é um analista de negócios especialista em levantamento de requisitos de software. 
          Seu objetivo é ajudar o usuário a refinar o "O Quê", "Porquê", "Orçamento" e os requisitos do projeto.
          
          REGRAS DE SUGESTÃO:
          Se você quiser sugerir uma melhoria para um campo específico do projeto, use o formato:
          [SUGGESTION:nome_do_campo]Texto sugerido aqui[/SUGGESTION]
          
          Campos simples: name, client, description, what, why, timeline, budget.
          
          SUGESTÃO DE REQUISITO:
          Se o usuário pedir ajuda com um requisito, sugira um objeto JSON completo:
          [SUGGESTION:requirement]{ "title": "...", "description": "...", "type": "funcional|não-funcional", "priority": "baixa|média|alta" }[/SUGGESTION]
          
          SUGESTÃO DE REGRAS DE NEGÓCIO:
          Se o usuário pedir ajuda com regras de negócio, sugira uma lista JSON:
          [SUGGESTION:businessRules][ "Regra 1", "Regra 2", "Regra 3" ][/SUGGESTION]
          IMPORTANTE: Sempre retorne cada regra como um item individual no array JSON, nunca junte várias regras em uma única string.
          
          Seja conciso, profissional e prestativo.
          Contexto atual do projeto: ${JSON.stringify(projectContext)}`,
        },
        history: history.map((m: any) => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      const response = await chat.sendMessage({ message });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chat API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Rota da API para extração de dados de PDFs
  // API Route for data extraction from PDFs
  app.post("/api/extract-pdf", async (req, res) => {
    try {
      const { text } = req.body;
      const apiKey = getGeminiKey();
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            text: `Você é um especialista em engenharia de requisitos...`, // Instrução completa mantida internamente
          },
        ],
        config: {
          responseMimeType: "application/json",
          // Definição do esquema de resposta para garantir extração estruturada
          // Response schema definition to ensure structured extraction
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              client: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['sistema', 'website', 'automação'] },
              description: { type: Type.STRING },
              what: { type: Type.STRING },
              why: { type: Type.STRING },
              objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
              requirements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ['alta', 'média', 'baixa'] },
                    type: { type: Type.STRING, enum: ['funcional', 'não funcional'] },
                  },
                  required: ['title', 'description', 'priority', 'type'],
                },
              },
              businessRules: { type: Type.ARRAY, items: { type: Type.STRING } },
              stakeholders: { type: Type.ARRAY, items: { type: Type.STRING } },
              timeline: { type: Type.STRING },
              budget: { type: Type.STRING },
            },
          },
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Extract PDF API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Configuração do middleware Vite para desenvolvimento ou arquivos estáticos para produção
  // Vite middleware setup for development or static files for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}


// Export for Vercel
const serverPromise = startServer();
export default (req: any, res: any) => {
  // This is a simple bridge for Vercel's serverless environment
  return serverPromise.then(() => {
    // In a real Vercel build, this handles the routing
  });
};
