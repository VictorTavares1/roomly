// src/services/api.js

// O endereço base, caso mude o nome da pasta no xampp...só preciso alterar este link
const API_BASE = "http://localhost/roomly_api";

// Função para fazer pedidos
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
    return await response.json();
  } catch (error) {
    console.error("Erro na API:", error);
    throw error;
  }
}

// === módulos de organização

export const authService = {
  login: (email, password) => request("login.php", "POST", { email, password }),
};

export const roomService = {
  getAll: () => request("get_rooms.php"),
};

export const reservationService = {
  create: (data) => request("create_reservation.php", "POST", data),
  getMyReservations: (userId) => request(`get_my_reservations.php?user_id=${userId}`),
  cancel: (id) => request("delete_reservation.php", "POST", { id }),
};

export const dashboardService = {
  getStats: () => request("get_dashboard_stats.php"),
};

export const userService = {
  getAll: () => request("get_users.php"),
  delete: (id) => request("delete_user.php", "POST", { id }),
  create: (data) => request("create_user.php", "POST", data), // 👈 NOVA LINHA
};