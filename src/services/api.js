const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1/Roomly/roomly_api";

/**
 * Obtém o token de autenticação guardado no localStorage.
 */
function getToken() {
  return localStorage.getItem("roomly_token");
}

/**
 * Função central de comunicação com a API.
 * Envia o token de autenticação automaticamente em todos os pedidos.
 */
async function request(endpoint, method = "GET", data = null) {
  const config = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Adicionar token de autenticação se existir
  const token = getToken();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, config);
    const text = await response.text();

    if (!text) {
      throw new Error("O servidor respondeu vazio!");
    }

    // Se o servidor retornou 401, o token é inválido — forçar logout
    if (response.status === 401) {
      localStorage.removeItem("roomly_user");
      localStorage.removeItem("roomly_token");
      window.location.href = "/login";
      throw new Error("Sessão expirada. Faz login novamente.");
    }

    try {
      const json = JSON.parse(text);

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


async function requestFormData(endpoint, formData) {
  const token = getToken();
  const config = {
    method: "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  };

  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, config);
    const text = await response.text();

    if (!text) throw new Error("O servidor respondeu vazio!");

    if (response.status === 401) {
      localStorage.removeItem("roomly_user");
      localStorage.removeItem("roomly_token");
      window.location.href = "/login";
      throw new Error("Sessão expirada. Faz login novamente.");
    }

    try {
      const json = JSON.parse(text);
      if (json.status === "erro") throw new Error(json.mensagem || "Erro desconhecido do servidor.");
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
  getAvailable: (date, startTime, endTime) =>
    request(`api/rooms/available.php?date=${date}&start_time=${encodeURIComponent(startTime)}&end_time=${encodeURIComponent(endTime)}`),
  create: (data) => request("api/rooms/create.php", "POST", data),
  update: (data) => request("api/rooms/update.php", "POST", data),
  delete: (id) => request("api/rooms/delete.php", "POST", { id }),
};

export const reservationService = {
  getAll: () => request("api/reservations/list_all.php"),
  getByDate: (date) => request(`api/reservations/list_by_date.php?date=${date}`),
  getCalendarEvents: () => request("api/reservations/calendar_events.php"),
  getMyReservations: () => request("api/reservations/list_my.php"),
  create: (data) => request("api/reservations/create.php", "POST", data),
  update: (data) => request("api/reservations/update.php", "POST", data),
  getByRoom: (roomId) => request(`api/reservations/list_by_room.php?room_id=${roomId}`),
  cancel: (id) => request("api/reservations/delete.php", "POST", { id }),
};

export const userService = {
  getAll: () => request("api/users/list.php"),
  create: (data) => request("api/users/create.php", "POST", data),
  toggleStatus: (id, is_active) => request("api/users/update_status.php", "POST", { id, is_active }),
  changeRole: (id, role) => request("api/users/update_role.php", "POST", { id, role }),
  updateProfile: (data) => request("api/auth/update_profile.php", "POST", data),
};

export const dashboardService = {
  getStats: () => request("api/reports/dashboard_stats.php"),
};

export const reportService = {
  getAll: () => request("api/reports/list.php"),
  create: ({ user_id, room_id, description, image }) => {
    const fd = new FormData();
    fd.append("user_id", user_id);
    fd.append("room_id", room_id);
    fd.append("description", description);
    if (image) fd.append("image", image);
    return requestFormData("api/reports/create.php", fd);
  },
  updateStatus: (id, status) => request("api/reports/update_status.php", "POST", { id, status }),
};