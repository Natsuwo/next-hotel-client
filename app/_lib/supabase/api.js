class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  buildURL(endpoint) {
    return `${this.baseURL}/${endpoint}`.replace(/([^:])\/+/g, "$1/");
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(this.buildURL(endpoint), {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });
      if (!response.ok) {
        return { ...(await response.json()), success: false };
      }
      return await response.json();
    } catch (error) {
      console.error("API request error:", error);
      return { error, success: false };
    }
  }

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: "GET", headers });
  }

  post(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers:
        Object.keys(headers).length > 0
          ? headers
          : {
              "Content-Type": "application/json",
            },
    });
  }

  put(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      headers:
        Object.keys(headers).length > 0
          ? headers
          : {
              "Content-Type": "application/json",
            },
    });
  }

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: "DELETE", headers });
  }
}

const api = new APIClient(
  process.env.NEXT_PUBLIC_BACKEND_API ?? "http://localhost:8000/api"
);
export default api;
