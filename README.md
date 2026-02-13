# Roomly | Gestão de Salas Inteligente

Sistema de gestão de salas, reservas e manutenção pensado para escolas e organizações. Interface moderna, responsiva e intuitiva.

![Roomly](https://img.shields.io/badge/Roomly-Gest%C3%A3o%20de%20Salas-2563eb?style=for-the-badge&logo=react)

---

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Roles e Permissões](#roles-e-permissões)
- [API Backend](#api-backend)
- [Licença](#licença)

---

## Sobre o Projeto

O **Roomly** permite a gestão centralizada de salas, equipamentos e avarias em ambiente escolar ou organizacional. Os utilizadores podem reservar salas, consultar disponibilidades e reportar problemas — tudo num só lugar, acessível em qualquer dispositivo.

---

## Funcionalidades

| Área | Descrição |
|------|-----------|
| **Dashboard** | Visão geral com estatísticas, gráficos de popularidade das salas e dicas úteis |
| **Ver Salas** | Listagem de todas as salas disponíveis com capacidade e detalhes |
| **Reservas** | Criação, consulta e gestão de reservas com calendário visual |
| **Reportar Problemas** | Sistema de tickets para avarias e manutenção |
| **Manutenção** | Gestão de reports (admin/funcionário) |
| **Utilizadores** | Criação e gestão de utilizadores, roles e estado (admin) |
| **Definições** | Perfil e alteração de palavra-passe |

---

## Stack Tecnológica

| Tecnologia | Uso |
|------------|-----|
| **React 19** | Interface e componentes |
| **Vite 7** | Build tool e dev server |
| **Tailwind CSS 4** | Estilos e design system |
| **DaisyUI** | Componentes UI prontos |
| **React Router DOM 7** | Navegação e rotas |
| **Recharts** | Gráficos do dashboard |
| **React Big Calendar** | Calendário de reservas |
| **Lucide React** | Ícones |
| **date-fns** | Manipulação de datas |

---

## Pré-requisitos

- **Node.js** 18+ (recomendado 20+)
- **npm** ou **pnpm**
- **API Roomly** em funcionamento (backend PHP)

---

## Instalação

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/SEU_USUARIO/roomly.git
   cd roomly
   ```

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Configurar a API** (ver secção [Configuração](#configuração))

4. **Iniciar o projeto**
   ```bash
   npm run dev
   ```

A aplicação estará disponível em `http://localhost:5173` (ou outra porta indicada pelo Vite).

---

## Configuração

### URL da API

A aplicação comunica com uma API PHP. Por defeito, a base URL é:

```
http://127.0.0.1/roomly_api
```

Para alterar em desenvolvimento ou produção, crie um ficheiro `.env` na raiz do projeto:

```env
VITE_API_URL=http://127.0.0.1/roomly_api
```

E atualize `src/services/api.js` para usar a variável:

```javascript
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1/roomly_api";
```

> **Nota:** O backend deve estar a correr e configurado antes de usar a aplicação.

---

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a build de produção |
| `npm run preview` | Pré-visualiza a build de produção |
| `npm run lint` | Executa o ESLint |

---

## Estrutura do Projeto

```
roomly/
├── public/
├── src/
│   ├── components/     # Componentes reutilizáveis (Layout, Sidebar, Input, etc.)
│   ├── context/        # AuthContext (autenticação global)
│   ├── pages/          # Páginas da aplicação
│   ├── services/       # API e serviços externos
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Roles e Permissões

| Role | Acesso |
|------|--------|
| **Utilizador** | Dashboard, salas, reservas, reportar problemas, definições |
| **Funcionário** | Tudo o anterior + Manutenção (gestão de reports) |
| **Admin** | Tudo + Criar salas, Gerir utilizadores, Gerir reservas |

---

## API Backend

O frontend espera uma API PHP com endpoints como:

- `login.php`
- `get_rooms.php`, `create_room.php`, `update_room.php`, `delete_room.php`
- `get_all_reservations.php`, `get_reservations_by_date.php`, `get_calendar_events.php`
- `get_my_reservations.php`, `create_reservation.php`, `update_reservation.php`, `delete_reservation.php`
- `get_users.php`, `create_user.php`, `update_user_status.php`, `update_user_role.php`
- `get_dashboard_stats.php`
- `get_reports.php`, `create_report.php`, `update_report_status.php`
- `update_password.php`, `update_profile.php`

Certifique-se de que o backend está configurado e acessível na URL definida.

---

## Licença

Projeto desenvolvido para fins educativos e organizacionais.

---

<p align="center">Feito com 💙 para a escola.</p>
