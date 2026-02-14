// src/services/api.js

// Tenta usar 127.0.0.1 para evitar problemas de IPv6 do Windows
const API_BASE = "http://127.0.0.1/roomly_api";

async function request(endpoint, method = "GET", data = null) {
  console.log(`🚀 A iniciar pedido para: ${API_BASE}/${endpoint}`); // LOG 1

  const config = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
    console.log("📦 Dados enviados:", config.body); // LOG 2
  }

  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, config);
    console.log("📶 Status da resposta:", response.status); // LOG 3

    // TRUQUE DE MESTRE: Lemos como TEXTO primeiro para ver o que vem
    const text = await response.text();
    // console.log("📄 Resposta crua do servidor:", text); // Descomenta se precisares de muito detalhe

    if (!text) {
      throw new Error("O servidor respondeu vazio!");
    }

    try {
      return JSON.parse(text); // Tenta converter para JSON
    } catch (e) {
      console.error("❌ O servidor não devolveu JSON! Devolveu isto:", text);
      throw new Error("Erro ao processar resposta do servidor (não é JSON).");
    }

  } catch (error) {
    console.error("☠️ ERRO FATAL no fetch:", error);
    throw error;
  }
}

// ... (código inicial igual)

// === SERVIÇOS ===

export const authService = {
  login: (email, password) => request("api/auth/login.php", "POST", { email, password }),
  updatePassword: (data) => request("api/auth/update_password.php", "POST", data),
};

export const roomService = {
  getAll: () => request("api/rooms/list.php"),
  create: (data) => request("api/rooms/create.php", "POST", data),
  update: (data) => request("api/rooms/update.php", "POST", data),
  delete: (id) => request("api/rooms/delete.php", "POST", { id }),
};

export const reservationService = {
  getAll: () => request("api/reservations/list_all.php"),

  // Funções novas para o Calendário e Agenda:
  getByDate: (date) => request(`api/reservations/list_by_date.php?date=${date}`),
  getCalendarEvents: () => request("api/reservations/calendar_events.php"),

  getMyReservations: (userId) => request(`api/reservations/list_my.php?user_id=${userId}`),
  create: (data) => request("api/reservations/create.php", "POST", data),
  update: (data) => request("api/reservations/update.php", "POST", data),
  cancel: (id) => request("api/reservations/delete.php", "POST", { id }), // delete.php trata do cancelamento
};

export const userService = {
  getAll: () => request("api/users/list.php"),
  create: (data) => request("api/users/create.php", "POST", data),
  toggleStatus: (id, is_active) => request("api/users/update_status.php", "POST", { id, is_active }),
  changeRole: (id, role) => request("api/users/update_role.php", "POST", { id, role }),
  updateProfile: (data) => request("api/auth/update_profile.php", "POST", data),
};

export const dashboardService = {
  getStats: (userId) => request(`api/reports/dashboard_stats.php?user_id=${userId}`),
};

export const reportService = {
  getAll: () => request("api/reports/list.php"),
  create: (data) => request("api/reports/create.php", "POST", data),
  updateStatus: (id, status) => request("api/reports/update_status.php", "POST", { id, status }),
};