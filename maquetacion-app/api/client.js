// Cliente HTTP simple para hablar con el backend de TaskFlow.
// Mantener esta capa separada evita mezclar UI con detalles de red.
(function () {
  const API_BASE_URL = "http://localhost:3000/api/v1/tasks";

  async function request(url, options) {
    const response = await fetch(url, options);

    // 204 no trae body; devolvemos null directamente.
    if (response.status === 204) return null;

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error || "Error de red";
      throw new Error(message);
    }
    return data;
  }

  async function getTasks() {
    return request(API_BASE_URL, { method: "GET" });
  }

  async function createTask(payload) {
    return request(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  async function updateTaskPartial(id, payload) {
    return request(`${API_BASE_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  async function replaceTask(id, payload) {
    return request(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  async function deleteTask(id) {
    return request(`${API_BASE_URL}/${id}`, { method: "DELETE" });
  }

  // Exponemos una única API global para usarla desde app.js.
  window.taskApi = {
    getTasks,
    createTask,
    updateTaskPartial,
    replaceTask,
    deleteTask,
  };
})();
