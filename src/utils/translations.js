export const translations = {
    // Auth & Users
    "Invalid credentials": "Email ou palavra-passe incorretos.",
    "User not found": "Utilizador não encontrado.",
    "Email already exists": "Este email já está registado.",
    "Password too short": "A palavra-passe é muito curta (mínimo 6 caracteres).",
    "Passwords do not match": "As palavras-passe não coincidem.",
    "Unauthorized": "Não tens permissão para realizar esta ação.",
    "Session expired": "Sessão expirada. Por favor, faz login novamente.",

    // Rooms & Reservations
    "Room not found": "Sala não encontrada.",
    "Room already exists": "Já existe uma sala com este nome.",
    "Reservation conflict": "Já existe uma reserva para este horário.",
    "End time must be after start time": "A hora de fim deve ser posterior à hora de início.",
    "Invalid date": "Data inválida.",
    "Capacity exceeded": "A capacidade da sala foi excedida.",

    // General
    "Database error": "Erro de conexão à base de dados.",
    "Unknown error": "Ocorreu um erro desconhecido. Tenta novamente.",
    "Operation successful": "Operação realizada com sucesso!",
    "Created successfully": "Criado com sucesso!",
    "Updated successfully": "Atualizado com sucesso!",
    "Deleted successfully": "Removido com sucesso!",
    "Missing required fields": "Por favor, preenche todos os campos obrigatórios."
};

/**
 * Traduz uma mensagem de erro/sucesso do backend.
 * Se a mensagem não estiver no dicionário, retorna a original (ou uma genérica se for muito técnica).
 */
export function translateMessage(message) {
    if (!message) return "";

    // Tenta encontrar a tradução exata
    if (translations[message]) {
        return translations[message];
    }

    // Tenta encontrar por palavras-chave (ex: "SQL Error: ...")
    if (message.includes("SQLSTATE")) return translations["Database error"];
    if (message.toLowerCase().includes("duplicate")) return "Registo duplicado.";

    return message;
}
