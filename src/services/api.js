const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

function getToken() {
  return localStorage.getItem("roomly_token");
}

async function request(endpoint, method = "GET", data = null) {
  const config = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  const token = getToken();
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  if (data) config.body = JSON.stringify(data);

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
  login: (email, password) => request("api/auth/login", "POST", { email, password }),
  updatePassword: (data) => request("api/auth/password", "PUT", data),
};

export const roomService = {
  getAll: () => request("api/rooms"),
  getAvailable: (date, startTime, endTime) =>
    request(`api/rooms/available?date=${date}&start_time=${encodeURIComponent(startTime)}&end_time=${encodeURIComponent(endTime)}`),
  create: (data) => request("api/rooms", "POST", data),
  update: (data) => request("api/rooms", "PUT", data),
  delete: (id) => request("api/rooms", "DELETE", { id }),
  getQRCodes: () => request("api/rooms/qrcodes"),
};

export const reservationService = {
  getAll: () => request("api/reservations/all"),
  getByDate: (date) => request(`api/reservations/by-date?date=${date}`),
  getCalendarEvents: () => request("api/reservations/calendar"),
  getMyReservations: () => request("api/reservations/my"),
  create: (data) => request("api/reservations", "POST", data),
  update: (data) => request("api/reservations", "PUT", data),
  getByRoom: (roomId) => request(`api/reservations/by-room?room_id=${roomId}`),
  cancel: (id) => request("api/reservations", "DELETE", { id }),
  checkin: (qr_token) => request("api/reservations/checkin", "POST", { qr_token }),
  confirmManual: (id) => request("api/reservations/confirm-manual", "POST", { id }),
};

export const userService = {
  getAll: () => request("api/users"),
  create: (data) => request("api/users", "POST", data),
  toggleStatus: (id, is_active) => request("api/users/status", "PUT", { id, is_active }),
  changeRole: (id, role) => request("api/users/role", "PUT", { id, role }),
  updateProfile: (data) => request("api/auth/profile", "PUT", data),
};

export const dashboardService = {
  getStats: () => request("api/reports/dashboard"),
};

export const reportService = {
  getAll: () => request("api/reports"),
  create: ({ room_id, title, description, image }) => {
    const fd = new FormData();
    if (room_id) fd.append("room_id", room_id);
    fd.append("title", title || "");
    fd.append("description", description);
    if (image) fd.append("image", image);
    return requestFormData("api/reports", fd);
  },
  updateStatus: (id, status) => request("api/reports/status", "PUT", { id, status }),
};
