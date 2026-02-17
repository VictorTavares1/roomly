const API_BASE = "http://127.0.0.1/roomly_api";

async function request(endpoint, method = "GET", data = null) {
  const config = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, config);
    const text = await response.text();

    if (!text) {
      throw new Error("O servidor respondeu vazio!");
    }

    try {
      const json = JSON.parse(text);

      // Se a API devolver um erro, lançamos com a mensagem para o catch apanhar
      if (json.status === "erro") {
        throw new Error(json.mensagem || "Erro desconhecido do servidor.");
      }

      return json;
    } catch (e) {
      if (e.message && !e.message.includes("JSON")) throw e;
      throw new Error("Erro ao processar resposta do servidor.");
    }

  } catch (error) {
    throw error;
  }
}


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