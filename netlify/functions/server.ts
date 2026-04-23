import express from "express";
import serverless from "serverless-http";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

// Configura o servidor Express como uma função serverless do Netlify
// Configures the Express server as a Netlify serverless function
const app = express();
app.use(express.json({ limit: '10mb' }));

// Obtém a chave da API de forma segura do ambiente do Netlify
// Safely retrieves the API key from the Netlify environment
const getGeminiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return key;
};

// Rotas da API para Chat e extração de PDF
// API Routes for Chat and PDF extraction
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, projectContext, isDeepMode } = req.body;
    const apiKey = getGeminiKey();
    const ai = new GoogleGenAI(apiKey);
    const modelName = isDeepMode ? "gemini-1.5-pro" : "gemini-1.5-flash";
    
    const chat = ai.chats.create({
      model: modelName,
      config: {
        thinkingConfig: isDeepMode ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
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
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/extract-pdf", async (req, res) => {
  try {
    const { text } = req.body;
    const apiKey = getGeminiKey();
    const ai = new GoogleGenAI(apiKey);
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          text: `Você é um especialista em engenharia de requisitos. Analise o seguinte texto extraído de um documento PDF e extraia as informações relevantes para preencher um levantamento de requisitos de software.
          
          Texto do PDF:
          ---
          ${text}
          ---
          
          Extraia as seguintes informações no formato JSON:
          - name: Nome do projeto
          - client: Nome do cliente
          - type: Tipo do projeto (deve ser um destes: 'sistema', 'website', 'automação')
          - description: Descrição geral do projeto
          - what: O que é o produto/serviço?
          - why: Por que está sendo construído?
          - objectives: Lista de objetivos principais (máximo 10)
          - requirements: Lista de requisitos funcionais e não funcionais. Cada requisito deve ter:
            - title: Título curto
            - description: Descrição detalhada
            - priority: 'alta', 'média' ou 'baixa'
            - type: 'funcional' ou 'não funcional'
          - businessRules: Lista de regras de negócio (apenas a descrição)
          - stakeholders: Lista de partes interessadas (apenas o nome/papel)
          - timeline: Prazo estimado
          - budget: Orçamento estimado
          
          Se alguma informação não for encontrada, deixe o campo como null ou lista vazia. Não invente informações que não estão no texto.`,
        },
      ],
      config: {
        responseMimeType: "application/json",
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
    res.status(500).json({ error: error.message });
  }
});

export const handler = serverless(app);
