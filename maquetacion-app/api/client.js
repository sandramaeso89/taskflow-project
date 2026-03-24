// Cliente HTTP simple para hablar con el backend de TaskFlow.
// Mantener esta capa separada evita mezclar UI con detalles de red.
(function () {
  // En local usamos Node en puerto 3000.
  // En producción probamos URL explícita y dos dominios candidatos de Vercel.
  const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const PROD_BASES = [
    globalThis.__TASKFLOW_API_BASE_URL,
    "https://taskflow-project-backend.vercel.app/api/v1/tasks",
  ].filter(Boolean);
  const API_BASE_URLS = isLocal ? ["http://localhost:3000/api/v1/tasks"] : PROD_BASES;

  async function request(url, options, baseIndex = 0) {
    try {
      const response = await fetch(url, options);

      // 204 no trae body; devolvemos null directamente.
      if (response.status === 204) return null;

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data?.error || "Error de red";
        throw new Error(message);
      }
      return data;
    } catch (error) {
      // Si falla por red, intentamos la siguiente URL de backend disponible.
      if (baseIndex + 1 < API_BASE_URLS.length) {
        const nextBase = API_BASE_URLS[baseIndex + 1];
        const nextUrl = url.replace(API_BASE_URLS[baseIndex], nextBase);
        return request(nextUrl, options, baseIndex + 1);
      }
      throw error;
    }
  }

  function endpoint(path = "") {
    return `${API_BASE_URLS[0]}${path}`;
  }

  async function getTasks() {
    return request(endpoint(), { method: "GET" });
  }

  async function createTask(payload) {
    return request(endpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  async function updateTaskPartial(id, payload) {
    return request(endpoint(`/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  async function replaceTask(id, payload) {
    return request(endpoint(`/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  async function deleteTask(id) {
    return request(endpoint(`/${id}`), { method: "DELETE" });
  }

  // Exponemos una única API global para usarla desde app.js.
  globalThis.taskApi = {
    getTasks,
    createTask,
    updateTaskPartial,
    replaceTask,
    deleteTask,
  };
})();
