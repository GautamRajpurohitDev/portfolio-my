import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Send HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor — handles 401 on authenticated admin routes.
// IMPORTANT: must NOT redirect when already on /admin/login (would cause a loop
// on wrong-credential 401 responses from the login endpoint itself).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin") &&
        window.location.pathname !== "/admin/login"
      ) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── PUBLIC API METHODS ────────────────────────────────────────

export const projectsApi = {
  getAll: () => api.get("/api/projects"),
  getBySlug: (slug: string) => api.get(`/api/projects/${slug}`),
  getAllAdmin: () => api.get("/api/projects/all"),
  getAdminById: (id: string, draft?: boolean) => api.get(`/api/projects/admin/${id}${draft ? '?draft=true' : ''}`),
  create: (data: unknown) => api.post("/api/projects", data),
  update: (id: string, data: unknown, action?: "draft" | "publish") => api.put(`/api/projects/${id}${action ? `?action=${action}` : ''}`, data),
  delete: (id: string) => api.delete(`/api/projects/${id}`),
};

export const mediaApi = {
  getAll: (type?: string, search?: string) => {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (search) params.append("search", search);
    return api.get(`/api/media?${params.toString()}`);
  },
  upload: (formData: FormData) => api.post("/api/media", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  update: (id: string, data: { alt?: string; originalName?: string }) => api.put(`/api/media/${id}`, data),
  delete: (id: string) => api.delete(`/api/media/${id}`),
};

export const journeyApi = {
  getAll: () => api.get("/api/journey"),
  getById: (id: string) => api.get(`/api/journey/${id}`),
  getAllAdmin: () => api.get("/api/journey/all"),
  create: (data: unknown) => api.post("/api/journey", data),
  update: (id: string, data: unknown) => api.put(`/api/journey/${id}`, data),
  delete: (id: string) => api.delete(`/api/journey/${id}`),
};

export const skillsApi = {
  getAll: () => api.get("/api/skills"),
  getAllAdmin: () => api.get("/api/skills/all"),
  create: (data: unknown) => api.post("/api/skills", data),
  update: (id: string, data: unknown) => api.put(`/api/skills/${id}`, data),
  delete: (id: string) => api.delete(`/api/skills/${id}`),
};

export const certificatesApi = {
  getAll: () => api.get("/api/certificates"),
  getAllAdmin: () => api.get("/api/certificates/all"),
  create: (data: unknown) => api.post("/api/certificates", data),
  update: (id: string, data: unknown) => api.put(`/api/certificates/${id}`, data),
  delete: (id: string) => api.delete(`/api/certificates/${id}`),
};

export const milestonesApi = {
  getAll: () => api.get("/api/milestones"),
  getAllAdmin: () => api.get("/api/milestones/all"),
  create: (data: unknown) => api.post("/api/milestones", data),
  update: (id: string, data: unknown) => api.put(`/api/milestones/${id}`, data),
  delete: (id: string) => api.delete(`/api/milestones/${id}`),
};

export const updatesApi = {
  getAll: () => api.get("/api/updates"),
  getBySlug: (slug: string) => api.get(`/api/updates/${slug}`),
  getAllAdmin: () => api.get("/api/updates/all"),
  create: (data: unknown) => api.post("/api/updates", data),
  update: (id: string, data: unknown) => api.put(`/api/updates/${id}`, data),
  delete: (id: string) => api.delete(`/api/updates/${id}`),
};

export const settingsApi = {
  /** Public — returns only public-safe fields */
  get: () => api.get("/api/settings"),
  /** Admin — returns full document including private fields */
  getAdmin: (draft?: boolean) => api.get(`/api/settings/admin${draft ? '?draft=true' : ''}`),
  /** Update — deep-merges patch into the settings document */
  update: (data: unknown, action?: "draft" | "publish") => 
    api.put(`/api/settings${action ? `?action=${action}` : ''}`, data),
};

/** Alias for settings — preferred name for new portfolio CMS code */
export const configApi = settingsApi;

export const authApi = {
  // 10-second timeout on login — ensures the button never stays permanently disabled
  // if the backend is unreachable or the network stalls.
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }, { timeout: 10_000 }),
  logout: () => api.post("/api/auth/logout"),
  me: () => api.get("/api/auth/me"),
};

export const uploadApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (filename: string) => api.delete(`/api/upload/${filename}`),
};

export const dashboardApi = {
  getOverview: () => api.get("/api/dashboard/overview"),
};

export const roadmapApi = {
  // ── Public ───────────────────────────────────────────────
  getSummary: () => api.get("/api/roadmap"),
  getPhases:  () => api.get("/api/roadmap/phases"),
  getDomains: (phaseId?: string) =>
    api.get(`/api/roadmap/domains${phaseId ? `?phase=${phaseId}` : ""}`),
  getTopics:  (domainId?: string, phaseId?: string) => {
    const params = new URLSearchParams();
    if (domainId) params.append("domain", domainId);
    if (phaseId)  params.append("phase",  phaseId);
    return api.get(`/api/roadmap/topics?${params.toString()}`);
  },

  // ── Admin ────────────────────────────────────────────────
  getAll:        () => api.get("/api/roadmap/all"),
  getAllPhases:   () => api.get("/api/roadmap/phases/all"),
  getAllDomains:  (phaseId?: string) =>
    api.get(`/api/roadmap/domains/all${phaseId ? `?phase=${phaseId}` : ""}`),
  getAllTopics:   (domainId?: string, phaseId?: string) => {
    const params = new URLSearchParams();
    if (domainId) params.append("domain", domainId);
    if (phaseId)  params.append("phase",  phaseId);
    return api.get(`/api/roadmap/topics/all?${params.toString()}`);
  },
  getAllTasks:    (topicId?: string) =>
    api.get(`/api/roadmap/tasks/all${topicId ? `?topic=${topicId}` : ""}`),

  // ── Phases CRUD ──────────────────────────────────────────
  createPhase: (data: unknown) => api.post("/api/roadmap/phases", data),
  updatePhase: (id: string, data: unknown) => api.put(`/api/roadmap/phases/${id}`, data),
  deletePhase: (id: string) => api.delete(`/api/roadmap/phases/${id}`),

  // ── Domains CRUD ─────────────────────────────────────────
  createDomain: (data: unknown) => api.post("/api/roadmap/domains", data),
  updateDomain: (id: string, data: unknown) => api.put(`/api/roadmap/domains/${id}`, data),
  deleteDomain: (id: string) => api.delete(`/api/roadmap/domains/${id}`),

  // ── Topics CRUD ──────────────────────────────────────────
  createTopic: (data: unknown) => api.post("/api/roadmap/topics", data),
  updateTopic: (id: string, data: unknown) => api.put(`/api/roadmap/topics/${id}`, data),
  deleteTopic: (id: string) => api.delete(`/api/roadmap/topics/${id}`),

  // ── Tasks CRUD ───────────────────────────────────────────
  createTask: (data: unknown) => api.post("/api/roadmap/tasks", data),
  updateTask: (id: string, data: unknown) => api.put(`/api/roadmap/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/api/roadmap/tasks/${id}`),
};

export const resumeApi = {
  getPublic: () => api.get("/api/resume"),
  getAll: () => api.get("/api/resume/all"),
  create: (data: unknown) => api.post("/api/resume", data),
  update: (id: string, data: unknown) => api.put(`/api/resume/${id}`, data),
  delete: (id: string) => api.delete(`/api/resume/${id}`),
};

