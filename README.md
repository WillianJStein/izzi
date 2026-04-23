<div align="center">
  <img src="./github-banner.png" alt="Izzi - AI Requirements System" width="100%" style="border-radius: 12px; margin-bottom: 20px;" />

  <br />
  
  <a href="#"><img src="https://img.shields.io/badge/React-8A2BE2?style=for-the-badge&logo=react&logoColor=00FFFF" alt="React" /></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-00FFFF?style=for-the-badge&logo=typescript&logoColor=8A2BE2" alt="TypeScript" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Firebase-8A2BE2?style=for-the-badge&logo=firebase&logoColor=00FFFF" alt="Firebase" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Gemini_API-00FFFF?style=for-the-badge&logo=google&logoColor=8A2BE2" alt="Gemini AI" /></a>
  
  <br />
  <br />
  
  <h2 align="center" style="color: #00FFFF;"><b>🧠 Sistema Inteligente de Gestão de Requisitos</b></h2>
  <p align="center" style="color: #8A2BE2; font-size: 16px;">
    <i>Automatize, pesquise, melhore e exporte seus requisitos de software com o poder da Inteligência Artificial.</i>
  </p>
</div>

---

## 🌌 Visão Geral do Projeto

O **Izzi** é um sistema profissional e moderno para levantamento e gestão de **requisitos de software**, desenvolvido para revolucionar a forma como analistas e desenvolvedores documentam seus sistemas.

Ele utiliza Inteligência Artificial avançada para auxiliar em todas as etapas da escrita técnica, e conta com um backend robusto para manter o controle total e o histórico dos seus projetos.

---

## ⚡ Funcionalidades Principais

<table>
  <tr>
    <td width="50%">
      <h3 style="color: #8A2BE2;">🤖 Inteligência Artificial Integrada</h3>
      <ul>
        <li><b>Sugestão de Ideias:</b> Brainstorming guiado pela IA para novos requisitos.</li>
        <li><b>Pesquisa de Referências:</b> Busca inteligente para embasamento técnico.</li>
        <li><b>Melhoria Automática:</b> Otimização da clareza e formalidade da escrita.</li>
        <li><b>Sugestão de Escrita:</b> Autocompletar avançado para redigir casos de uso.</li>
      </ul>
    </td>
    <td width="50%">
      <h3 style="color: #00FFFF;">🗄️ Backend & Exportação</h3>
      <ul>
        <li><b>Histórico Seguro:</b> Todo o histórico de versões e requisitos fica salvo via Firebase.</li>
        <li><b>Exportação para PDF:</b> Após revisar tudo, gere documentos altamente profissionais em PDF, prontos para envio.</li>
        <li><b>Gerenciamento em Nuvem:</b> Acesse seus projetos de requisitos de qualquer lugar.</li>
      </ul>
    </td>
  </tr>
</table>

---

## ⚠️ AVISO: COMO UTILIZAR O SISTEMA

Este repositório é um **modelo (template/base)** do sistema. Para que ele funcione no seu computador, **é OBRIGATÓRIO** que você configure as suas próprias ferramentas.

> **Você NÃO DEVE utilizar as minhas chaves de API, nem o meu banco de dados!**

Você deverá:
1. **Colocar a sua própria chave da API de Inteligência Artificial** (Google Gemini).
2. **Configurar o seu próprio Firebase** (Criar seu banco de dados e autenticação).
3. **Alterar as credenciais no código** para que o sistema funcione com os **SEUS DADOS**, garantindo total privacidade do seu histórico e de suas operações.

---

## 🚀 Guia de Instalação e Configuração

Siga os passos abaixo com atenção para rodar o projeto localmente de forma independente:

### 1. Preparando o Ambiente
Você precisará ter instalado:
- [Node.js](https://nodejs.org/) (Versão recomendada: 16+)
- Git
- Uma conta no [Google AI Studio](https://aistudio.google.com/) (para gerar a API da IA)
- Uma conta no [Firebase](https://console.firebase.google.com/)

### 2. Clonando o Repositório
Abra seu terminal e digite:
```bash
git clone https://github.com/WillianJStein/izzi.git
cd izzi
```

### 3. Instalando as Dependências
Baixe todos os pacotes necessários:
```bash
npm install
```

### 4. Configurando suas Próprias APIs (Obrigatório)
Crie um arquivo chamado `.env` (ou `.env.local`) na pasta raiz do projeto. Preencha com os dados do **SEU** projeto Firebase e da **SUA** API de IA:

```env
# Sua Chave da API de Inteligência Artificial
VITE_GEMINI_API_KEY="COLOQUE_SUA_CHAVE_AQUI"

# Suas Chaves do seu próprio projeto Firebase
VITE_FIREBASE_API_KEY="SUA_CHAVE_DO_FIREBASE"
VITE_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="seu-projeto-id"
VITE_FIREBASE_STORAGE_BUCKET="seu-projeto.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="seu-sender-id"
VITE_FIREBASE_APP_ID="seu-app-id"
```

### 5. Iniciar a Aplicação
Com tudo configurado, rode o servidor local:
```bash
npm run dev
```
Acesse `http://localhost:5173` para utilizar o sistema!

---

<div align="center">
  <p>Construído com 💜 & 🩵</p>
</div>
