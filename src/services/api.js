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

// === SERVIÇOS ===

export const authService = {
  login: (email, password) => request("login.php", "POST", { email, password }),
  updatePassword: (data) => request("update_password.php", "POST", data),
};

export const roomService = {
  getAll: () => request("get_rooms.php"),
  create: (data) => request("create_room.php", "POST", data),
  update: (data) => request("update_room.php", "POST", data),
  delete: (id) => request("delete_room.php", "POST", { id }),
};

export const reservationService = {
  getAll: () => request("get_all_reservations.php"),

  // Funções novas para o Calendário e Agenda:
  getByDate: (date) => request(`get_reservations_by_date.php?date=${date}`),
  getCalendarEvents: () => request("get_calendar_events.php"),

  getMyReservations: (userId) => request(`get_my_reservations.php?user_id=${userId}`),
  create: (data) => request("create_reservation.php", "POST", data),
  update: (data) => request("update_reservation.php", "POST", data),
  cancel: (id) => request("delete_reservation.php", "POST", { id }),
};

export const userService = {
  getAll: () => request("get_users.php"),
  create: (data) => request("create_user.php", "POST", data),
  toggleStatus: (id, is_active) => request("update_user_status.php", "POST", { id, is_active }),
  changeRole: (id, role) => request("update_user_role.php", "POST", { id, role }),
  updateProfile: (data) => request("update_profile.php", "POST", data),
};

export const dashboardService = {
  getStats: (userId) => request(`get_dashboard_stats.php?user_id=${userId}`),
};

export const reportService = {
  getAll: () => request("get_reports.php"),
  create: (data) => request("create_report.php", "POST", data),
  updateStatus: (id, status) => request("update_report_status.php", "POST", { id, status }),
};