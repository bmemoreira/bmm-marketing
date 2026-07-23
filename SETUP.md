# 📅 Sistema de Agendamento com Google Calendar - BMM Marketing

Documentação completa para integração do sistema de agendamento com Google Calendar, Google Docs e notificações por email.

---

## 🚀 Funcionalidades Implementadas

✅ **Calendário Google integrado** no formulário de contacto (Passo 6)  
✅ **Blocos de 1 hora** - 09h às 20h, seg-sex  
✅ **Bloqueio automático** de horas já ocupadas  
✅ **Eventos sincronizados** no Google Calendar do cliente e proprietário  
✅ **Notificações automáticas** - 3 dias, 1 dia, 3h, 1h antes  
✅ **Emails de confirmação** enviados automaticamente  
✅ **Registro em Google Docs** com detalhes da reunião  
✅ **Botões "Fale Conosco"** nos popups dos cards de serviços  

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Google Cloud](#configuração-do-google-cloud)
3. [Instalação Local](#instalação-local)
4. [Variáveis de Ambiente](#variáveis-de-ambiente)
5. [Estrutura de Ficheiros](#estrutura-de-ficheiros)
6. [Integração no HTML](#integração-no-html)
7. [Deploy](#deploy)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

- **Node.js** v14+ e **npm**
- **Conta Google** (pessoal ou empresa)
- **Google Cloud Project** criado
- **Acesso ao Google Calendar API**
- **Acesso ao Google Docs API**
- **Acesso ao Gmail API** (para envio de emails)

---

## 🌐 Configuração do Google Cloud

### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Clique em **"Select a Project"** → **"NEW PROJECT"**
3. Nome: `BMM Marketing Booking System`
4. Clique em **"CREATE"**

### 2. Ativar APIs Necessárias

No console, procure por cada uma:

- **Google Calendar API** → Clique em **ENABLE**
- **Google Docs API** → Clique em **ENABLE**
- **Gmail API** → Clique em **ENABLE**
- **Google Drive API** → Clique em **ENABLE**

### 3. Criar Credenciais OAuth 2.0

1. No menu lateral, clique em **"Credentials"** (Credenciais)
2. Clique em **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Se pedido, configure a **OAuth Consent Screen**:
   - Tipo de utilizador: **External**
   - Nome da app: `BMM Marketing`
   - Email de suporte: seu email
   - Clique em **SAVE AND CONTINUE**

4. De volta a **Credentials**, clique em **"Create Credentials"** → **"OAuth 2.0 Client ID"**
5. Tipo: **Web application**
6. Nome: `BMM Marketing Web Client`
7. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://seu-dominio.com
   ```
8. **Authorized redirect URIs**:
   ```
   http://localhost:3000/auth/google/callback
   https://seu-dominio.com/auth/google/callback
   ```
9. Clique em **CREATE**
10. Copie **Client ID** e **Client Secret** (guarde num local seguro!)

### 4. Configurar Permissões de API

1. Vá para **APIs & Services** → **OAuth 2.0 Consent Screen**
2. Em **Scopes**, clique em **"Add or Remove Scopes"**
3. Adicione:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/documents`
   - `https://www.googleapis.com/auth/drive`
   - `https://www.googleapis.com/auth/gmail.send`
4. Clique em **UPDATE** e depois em **SAVE AND CONTINUE**

### 5. Adicionar Contas de Teste

1. Na **OAuth Consent Screen**, vá para **Test users**
2. Clique em **"Add users"**
3. Adicione o seu email (e dos clientes que forem testar)
4. Clique em **SAVE**

---

## 💻 Instalação Local

### 1. Clonar o Repositório

```bash
git clone https://github.com/bmemoreira/bmm-marketing.git
cd bmm-marketing
```

### 2. Trocar para a Branch Feature

```bash
git checkout feature/google-calendar-booking-system
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Criar Ficheiro `.env`

Copie o ficheiro `.env.example` e preencha com suas credenciais:

```bash
cp .env.example .env
```

Abra `.env` e preencha:

```env
# Google OAuth 2.0
GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Google Calendar
GOOGLE_CALENDAR_ID=seu_email@gmail.com

# Google Docs
GOOGLE_DOCS_FOLDER_ID=seu_folder_id_do_google_drive
GOOGLE_DOCS_TEMPLATE_ID=seu_documento_template_id

# Email Notificações
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_app_password_aqui
EMAIL_FROM=seu_email@gmail.com
EMAIL_FROM_NAME=BMM Marketing

# Server
NODE_ENV=development
PORT=3000
SESSION_SECRET=seu_session_secret_aleatorio

# Horário de Funcionamento
BUSINESS_HOURS_START=09
BUSINESS_HOURS_END=20
BUSINESS_DAYS=1,2,3,4,5

# Fuso Horário
TIMEZONE=Europe/Lisbon

# Notificações (em minutos antes do evento)
NOTIFICATION_TIMES=4320,1440,180,60
```

### 5. Gerar Google API Credentials

Para uma melhor integração, é necessário guardar as credenciais de forma segura:

```bash
node scripts/generate-credentials.js
```

---

## 📝 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `GOOGLE_CLIENT_ID` | ID do Cliente OAuth | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Segredo do Cliente OAuth | `xxx` |
| `GOOGLE_REDIRECT_URI` | URL de callback OAuth | `http://localhost:3000/auth/google/callback` |
| `GOOGLE_CALENDAR_ID` | Email do calendário | `seu_email@gmail.com` |
| `GOOGLE_DOCS_FOLDER_ID` | ID da pasta no Google Drive | `xxx` |
| `SMTP_USER` | Email para envio de emails | `seu_email@gmail.com` |
| `SMTP_PASSWORD` | Senha da app Gmail | `xxx` |
| `BUSINESS_HOURS_START` | Hora de início | `09` |
| `BUSINESS_HOURS_END` | Hora de fim | `20` |
| `TIMEZONE` | Fuso horário | `Europe/Lisbon` |

---

## 📂 Estrutura de Ficheiros

```
bmm-marketing/
├── server.js                          # Servidor Express principal
├── package.json                       # Dependências
├── .env.example                       # Variáveis de ambiente (template)
├── .env                               # Variáveis de ambiente (local)
│
├── public/
│   ├── calendar-booking.js            # Lógica do cliente (booking)
│   ├── calendar-booking.css           # Estilos do calendário
│   ├── index.html                     # HTML principal (site)
│   ├── style.css                      # CSS do site
│   └── script.js                      # JavaScript do site
│
├── routes/
│   ├── auth.js                        # Rotas de autenticação
│   └── booking.js                     # Rotas de agendamento
│
├── utils/
│   ├── gmail-service.js               # Serviço de email
│   ├── calendar-service.js            # Serviço de calendário
│   └── docs-service.js                # Serviço de Google Docs
│
└── docs/
    └── SETUP.md                       # Esta documentação
```

---

## 🔗 Integração no HTML

### 1. Incluir CSS e JS do Calendário

No `index.html`, adicione antes da tag `</head>`:

```html
<link rel="stylesheet" href="./calendar-booking.css">
```

E antes da tag `</body>`:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.45/moment-timezone-with-data.min.js"></script>
<script src="./calendar-booking.js"></script>
```

### 2. Modificar o Formulário de Contacto

No passo 6 (field de data), substitua:

```html
<!-- ANTES (campo de data simples) -->
<input type="date" name="meeting_date" placeholder="Escolha a data">

<!-- DEPOIS (será gerado dinamicamente pelo JavaScript) -->
<!-- O calendário será renderizado aqui -->
```

O JavaScript detectará automaticamente quando o utilizador chegar ao formulário de contacto.

### 3. Adicionar Botão de Autenticação (Opcional)

Se quiser um botão visível de autenticação:

```html
<button id="googleAuthBtn" type="button">
  Autenticar com Google para Agendar
</button>
```

---

## 🚀 Executar Localmente

### 1. Inicie o Servidor

```bash
npm start
```

Ou em modo desenvolvimento (com auto-reload):

```bash
npm run dev
```

O servidor estará disponível em: `http://localhost:3000`

### 2. Teste o Fluxo

1. Abra o site: `http://localhost:3000`
2. Clique em **"Pedir Contacto"** (ou num card de serviço)
3. Preencha os dados iniciais
4. Quando chegar ao calendário, clique em **"Autenticar com Google"**
5. Faça login com sua conta Google
6. Escolha uma data e horário disponível
7. Clique em **"Agendar Reunião"**
8. Receba confirmação por email

---

## 🌍 Deploy (Netlify / Vercel / Render)

### Deploy no Render

1. Faça push para o GitHub:
```bash
git push origin feature/google-calendar-booking-system
```

2. Acesse [Render.com](https://render.com)
3. Clique em **"New Web Service"**
4. Conecte o repositório GitHub
5. Configurações:
   - **Name**: `bmm-marketing-booking`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Clique em **"Advanced"** e adicione as variáveis de ambiente do `.env`
7. Clique em **"Create Web Service"**

### Deploy no Vercel (não recomendado para Node.js com estado de sessão)

Se usar Vercel, será necessário adaptar o servidor para usar banco de dados para sessões.

### Deploy no Netlify Functions (recomendado)

1. Instale Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Configure o projeto:
```bash
netlify init
```

3. Adapte o servidor para Netlify Functions (ficheiro separado).

---

## 🐛 Troubleshooting

### Erro: "Invalid OAuth Client"

**Solução**: Verifique se o `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão corretos no `.env`

### Erro: "Calendar not found"

**Solução**: Verifique se o `GOOGLE_CALENDAR_ID` é o email correto do calendário Google

### Emails não chegam

**Solução**: 
- Ative "Acesso a Aplicativos Menos Seguros" na conta Google
- Use uma "App Password" em vez de senha normal (para contas com 2FA)

### Horários não aparecem

**Solução**: 
- Verifique se o fuso horário está correto (`TIMEZONE`)
- Confirme se há eventos conflitantes no Google Calendar

### CORS Error

**Solução**: Verifique se a URL de origem está adicionada no Google Cloud Console

---

## 📧 Configurar Gmail App Password

Se usar Gmail com autenticação de 2 fatores:

1. Aceda a [myaccount.google.com/security](https://myaccount.google.com/security)
2. Ative **"2-Step Verification"** (se não estiver ativado)
3. Vá para **"App passwords"**
4. Selecione **Mail** e **Windows Computer** (ou seu OS)
5. Copie a senha gerada
6. Use esta senha no `.env` como `SMTP_PASSWORD`

---

## 📞 Suporte

Para dúvidas ou problemas:
- Email: [bmemoreira@gmail.com](mailto:bmemoreira@gmail.com)
- WhatsApp: [+351 969 504 757](https://wa.me/351969504757)

---

## 📄 Licença

Projeto desenvolvido para BMM Marketing Digital © 2026

---

**Última atualização**: 23 de Julho de 2026
