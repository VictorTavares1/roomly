<p align="center">
  <img src="https://img.shields.io/badge/Roomly-Plataforma%20de%20Gest%C3%A3o%20Escolar-1e293b?style=for-the-badge&logo=react&logoColor=white" />
</p>

<h3 align="center">Sistema integrado de gestão de salas, reservas e manutenção para instituições de ensino.</h3>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7.2-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/PHP-8.x-777BB4?style=flat-square&logo=php&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white" />
</p>

---

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Roles e Permissões](#roles-e-permissões)
- [API Backend — Endpoints](#api-backend--endpoints)
- [Licença](#licença)

---

## Sobre o Projeto

O **Roomly** é uma plataforma oficial de gestão escolar que permite a administração centralizada de espaços, equipamentos e manutenção. Concebido para escolas e entidades educativas, o sistema oferece:

- **Agendamento de salas e laboratórios** em tempo real, sem conflitos de horários
- **Controlo hierárquico de acessos** com permissões diferenciadas (Administrador, Funcionário, Utilizador)
- **Gestão de manutenção** através de um sistema de tickets para registo e acompanhamento de avarias
- **Dashboard analítico** com estatísticas de utilização e gráficos de popularidade

O acesso é restrito a docentes, funcionários e administradores autorizados pela instituição.

---

## Funcionalidades

### Utilizador Autenticado

| Módulo | Descrição |
|--------|-----------|
| **Dashboard** | Painel com estatísticas pessoais, gráficos de popularidade das salas, próximas reservas e ações rápidas |
| **Ver Salas** | Listagem completa de salas disponíveis com capacidade, tipo e detalhes |
| **Nova Reserva** | Criação de reservas com seleção de sala, data, horário e motivo |
| **Minhas Reservas** | Consulta e cancelamento das reservas pessoais |
| **Reportar Problema** | Submissão de tickets de avarias ou problemas técnicos |
| **Meus Reportes** | Acompanhamento do estado dos reportes submetidos |
| **Definições** | Edição de perfil, alteração de palavra-passe, tema claro/escuro |

### Funcionário (Staff)

| Módulo | Descrição |
|--------|-----------|
| **Gestão de Manutenção** | Visualização e atualização do estado de todos os tickets de manutenção |

### Administrador

| Módulo | Descrição |
|--------|-----------|
| **Criar Sala** | Registo de novas salas com nome, capacidade, tipo e equipamentos |
| **Editar/Eliminar Sala** | Gestão completa do inventário de salas |
| **Gerir Reservas** | Visualização e administração de todas as reservas do sistema |
| **Gerir Utilizadores** | Criação de contas, alteração de roles, ativação/desativação de utilizadores |

### Funcionalidades Transversais

- 🌙 **Modo Escuro** — Comutação entre tema claro e escuro
- 📱 **Design Responsivo** — Interface adaptada a desktop, tablet e mobile
- 🔒 **Autenticação Persistente** — Sessão mantida via `localStorage`
- 🔐 **Rotas Protegidas** — Acesso condicionado por role (PrivateRoute, AdminRoute, StaffRoute)

---

## Stack Tecnológica

### Frontend

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **React** | 19.2 | Biblioteca de UI e componentes |
| **Vite** | 7.2 | Build tool e dev server |
| **Tailwind CSS** | 4.1 | Estilos e design system |
| **DaisyUI** | 5.5 | Componentes UI complementares |
| **React Router DOM** | 7.10 | Navegação SPA e rotas protegidas |
| **Recharts** | 3.7 | Gráficos e visualização de dados |
| **React Big Calendar** | 1.19 | Calendário interativo de reservas |
| **Lucide React** | 0.555 | Biblioteca de ícones |
| **date-fns** | 4.1 | Manipulação e formatação de datas |
| **React Hot Toast** | 2.6 | Notificações e feedback visual |
| **Poppins** | — | Fonte tipográfica principal (Google Fonts) |

### Backend

| Tecnologia | Função |
|------------|--------|
| **PHP 8.x** | API REST (endpoints JSON) |
| **MySQL** | Base de dados relacional |
| **XAMPP** | Ambiente de desenvolvimento local (Apache + MySQL + PHP) |
| **PDO** | Acesso seguro à base de dados |

---

## Pré-requisitos

Antes de iniciar, certifique-se de que tem instalado:

| Requisito | Versão Mínima | Notas |
|-----------|---------------|-------|
| **Node.js** | 18+ (recomendado 20+) | Para compilar e servir o frontend |
| **npm** | Incluído com Node.js | Gestor de pacotes |
| **XAMPP** | 8.x | Inclui Apache, MySQL e PHP |
| **Git** | Qualquer | Para clonar o repositório |

---

## Instalação e Configuração

### 1. Clonar o Repositório

```bash
git clone https://github.com/SEU_USUARIO/roomly.git
cd roomly
```

### 2. Instalar Dependências do Frontend

```bash
npm install
```

### 3. Configurar o Backend (XAMPP)

1. **Iniciar o XAMPP** — Ativar os módulos **Apache** e **MySQL**
2. **Criar a base de dados** — No phpMyAdmin (`http://localhost/phpmyadmin`), criar uma base de dados chamada `roomly`
3. **Importar o schema** — Importar o ficheiro SQL com as tabelas necessárias (`users`, `rooms`, `reservations`, `reports`)
4. **Colocar a API** — Copiar a pasta `roomly_api` para `C:\xampp\htdocs\`

A estrutura final deve ser:
```
C:\xampp\htdocs\roomly_api\
├── config/
│   ├── cors.php          # Headers CORS centralizados
│   ├── db.php            # Conexão PDO à base de dados
│   └── logger.php        # Sistema de logging
└── api/
    ├── auth/             # Login, password, perfil
    ├── rooms/            # CRUD de salas
    ├── reservations/     # CRUD de reservas + calendário
    ├── reports/          # Tickets + dashboard stats
    └── users/            # Gestão de utilizadores
```

### 4. Configurar a URL da API

A URL base da API está definida em `src/services/api.js`:

```javascript
const API_BASE = "http://127.0.0.1/roomly_api";
```

Se o backend estiver num endereço diferente, altere esta constante.

### 5. Configurar a Base de Dados

Em `roomly_api/config/db.php`, confirme os dados de acesso:

```php
$host = 'localhost';
$db_name = 'roomly';
$username = 'root';
$password = '';
```

### 6. Iniciar a Aplicação

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

> **Nota:** O Apache do XAMPP deve estar a correr para que o frontend consiga comunicar com a API.

---

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento Vite |
| `npm run build` | Gera o bundle otimizado de produção |
| `npm run preview` | Pré-visualiza a build de produção localmente |
| `npm run lint` | Executa o ESLint para análise de código |

---

## Estrutura do Projeto

### Frontend (`/src`)

```
src/
├── components/           # Componentes Reutilizáveis
│   ├── Layout.jsx        # Layout principal (Sidebar + conteúdo)
│   ├── Sidebar.jsx       # Barra lateral de navegação
│   ├── AdminRoute.jsx    # Proteção de rotas (só admin)
│   ├── StaffRoute.jsx    # Proteção de rotas (admin + funcionário)
│   ├── Button.jsx        # Botão estilizado reutilizável
│   ├── Input.jsx         # Campo de input estilizado
│   ├── Select.jsx        # Select dropdown estilizado
│   ├── SearchBar.jsx     # Barra de pesquisa
│   ├── RoomCard.jsx      # Cartão de sala
│   ├── Scheduler.jsx     # Componente de calendário
│   └── Logo.jsx          # Logotipo SVG
│
├── context/
│   ├── AuthContext.jsx   # Estado global de autenticação
│   └── ThemeContext.jsx  # Estado global do tema (claro/escuro)
│
├── hooks/
│   └── index.js          # Custom hooks
│
├── pages/                # 16 Páginas
│   ├── Landing.jsx       # Página inicial pública (institucional)
│   ├── Login.jsx         # Autenticação (área reservada)
│   ├── Dashboard.jsx     # Painel principal com estatísticas
│   ├── Rooms.jsx         # Listagem de salas
│   ├── CreateRoom.jsx    # Criação de sala (admin)
│   ├── EditRoom.jsx      # Edição de sala (admin)
│   ├── NewReservation.jsx    # Nova reserva
│   ├── MyReservations.jsx    # Reservas pessoais
│   ├── EditReservation.jsx   # Edição de reserva
│   ├── ManageReservations.jsx # Gestão de reservas (admin)
│   ├── ReportIssue.jsx       # Reportar problema
│   ├── MyReports.jsx         # Meus reportes
│   ├── ManageReports.jsx     # Gestão de manutenção (staff)
│   ├── ManageUsers.jsx       # Gestão de utilizadores (admin)
│   ├── Settings.jsx          # Definições e perfil
│   └── Profile.jsx           # Perfil do utilizador
│
├── services/
│   └── api.js            # Camada de abstração da API (fetch)
│
├── utils/
│   └── translations.js   # Tradução de mensagens da API
│
├── styles/               # Estilos adicionais
├── App.jsx               # Router principal e definição de rotas
├── main.jsx              # Entry point (AuthProvider + ThemeProvider)
└── index.css             # Estilos globais e configuração Tailwind
```

### Backend (`/roomly_api`)

```
roomly_api/
├── config/
│   ├── cors.php              # Headers CORS + preflight OPTIONS
│   ├── db.php                # Conexão PDO ao MySQL
│   └── logger.php            # Logging de erros
│
└── api/
    ├── auth/
    │   ├── login.php             # POST — Autenticação
    │   ├── update_password.php   # POST — Alterar palavra-passe
    │   └── update_profile.php    # POST — Atualizar perfil
    │
    ├── rooms/
    │   ├── list.php              # GET — Listar salas
    │   ├── create.php            # POST — Criar sala
    │   ├── update.php            # POST — Atualizar sala
    │   └── delete.php            # POST — Eliminar sala
    │
    ├── reservations/
    │   ├── list_all.php          # GET — Todas as reservas
    │   ├── list_my.php           # GET — Reservas do utilizador
    │   ├── list_by_date.php      # GET — Reservas por data
    │   ├── calendar_events.php   # GET — Eventos para calendário
    │   ├── create.php            # POST — Criar reserva
    │   ├── update.php            # POST — Atualizar reserva
    │   ├── delete.php            # POST — Cancelar reserva
    │   └── admin_delete.php      # POST — Eliminar reserva (admin)
    │
    ├── reports/
    │   ├── list.php              # GET — Listar reportes
    │   ├── create.php            # POST — Criar reporte
    │   ├── update_status.php     # POST — Atualizar estado
    │   └── dashboard_stats.php   # GET — Estatísticas do dashboard
    │
    └── users/
        ├── list.php              # GET — Listar utilizadores
        ├── create.php            # POST — Criar utilizador
        ├── update_status.php     # POST — Ativar/desativar conta
        └── update_role.php       # POST — Alterar role
```

---

## Roles e Permissões

O sistema possui três níveis de acesso hierárquicos:

| Role | Nível | Acessos |
|------|-------|---------|
| **Utilizador** | Base | Dashboard, Salas, Reservas pessoais, Reportar problemas, Definições |
| **Funcionário** | Intermédio | Tudo do utilizador + Gestão de manutenção (painel de tickets) |
| **Admin** | Total | Tudo + Criar/Editar/Eliminar salas, Gerir utilizadores, Gerir todas as reservas |

As rotas são protegidas no frontend através de componentes wrapper:
- `PrivateRoute` — Exige autenticação (qualquer role)
- `StaffRoute` — Exige role `funcionario` ou `admin`
- `AdminRoute` — Exige role `admin`

---

## API Backend — Endpoints

Todos os endpoints comunicam em **JSON** via `Content-Type: application/json`.

### Autenticação (`/api/auth/`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `login.php` | Autenticação com email e password |
| `POST` | `update_password.php` | Alteração de palavra-passe |
| `POST` | `update_profile.php` | Atualização de dados do perfil |

### Salas (`/api/rooms/`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `list.php` | Listar todas as salas |
| `POST` | `create.php` | Criar nova sala |
| `POST` | `update.php` | Atualizar dados de uma sala |
| `POST` | `delete.php` | Eliminar uma sala |

### Reservas (`/api/reservations/`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `list_all.php` | Listar todas as reservas |
| `GET` | `list_my.php?user_id={id}` | Reservas de um utilizador |
| `GET` | `list_by_date.php?date={YYYY-MM-DD}` | Reservas por data |
| `GET` | `calendar_events.php` | Eventos formatados para calendário |
| `POST` | `create.php` | Criar nova reserva |
| `POST` | `update.php` | Atualizar reserva |
| `POST` | `delete.php` | Cancelar reserva |
| `POST` | `admin_delete.php` | Eliminar reserva (admin) |

### Reportes / Manutenção (`/api/reports/`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `list.php` | Listar todos os reportes |
| `GET` | `dashboard_stats.php?user_id={id}` | Estatísticas do dashboard |
| `POST` | `create.php` | Criar novo reporte |
| `POST` | `update_status.php` | Atualizar estado de reporte |

### Utilizadores (`/api/users/`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `list.php` | Listar todos os utilizadores |
| `POST` | `create.php` | Criar novo utilizador |
| `POST` | `update_status.php` | Ativar/desativar utilizador |
| `POST` | `update_role.php` | Alterar role do utilizador |

---

## Licença

Projeto desenvolvido para fins educativos e de gestão institucional.

---

<p align="center">
  <strong>Roomly Education Platform</strong> · © 2026 · Todos os direitos reservados.
</p>
