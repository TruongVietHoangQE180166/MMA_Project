import { WeeklySessionResponse, SessionUserResponse, SubjectCountResponse, StasiscHoursRuleResponse } from "../types/session";

const API_BASE_URL = "https://concentrate-cxcthbapc3bdadh3.southeastasia-01.azurewebsites.net";

export const sessionApi = {

  getWeeklySession: async (token: string): Promise<WeeklySessionResponse> => {
    if (!token) throw new Error("Token is required");
    if (!token.trim()) throw new Error("Token cannot be empty");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
  
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/weekly-session`, {
        method: "GET",
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data?.message?.messageDetail || "Get weekly session failed");
      }
      return data as WeeklySessionResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out");
      } else if (error instanceof TypeError) {
        throw new Error("Network error");
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("An unknown error occurred during get weekly session");
      }
    }
  },

  getSessionUser: async (token: string, query?: { page?: number; size?: number; field?: string; direction?: string }): Promise<SessionUserResponse> => {
    if (!token) throw new Error("Token is required");
    const page = query?.page ?? 1;
    const size = query?.size ?? 10;
    const field = query?.field ?? 'startTime';
    const direction = query?.direction ?? 'desc';
    const url = `${API_BASE_URL}/api/session/user?page=${page}&size=${size}&field=${field}&direction=${direction}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message?.messageDetail || "Get session user failed");
      }
      return data as SessionUserResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out");
      } else if (error instanceof TypeError) {
        throw new Error("Network error");
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("An unknown error occurred during get session user");
      }
    }
  },

  getSubjectCount: async (token: string): Promise<SubjectCountResponse> => {
    if (!token) throw new Error("Token is required");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/subject-count`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message?.messageDetail || "Get subject count failed");
      }
      return data as SubjectCountResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out");
      } else if (error instanceof TypeError) {
        throw new Error("Network error");
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("An unknown error occurred during get subject count");
      }
    }
  },

  getStasiscHoursRule: async (token: string): Promise<StasiscHoursRuleResponse> => {
    if (!token) throw new Error("Token is required");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/statisc-hours-rule`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message?.messageDetail || "Get stasisc hours rule failed");
      }
      return data as StasiscHoursRuleResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out");
      } else if (error instanceof TypeError) {
        throw new Error("Network error");
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("An unknown error occurred during get stasisc hours rule");
      }
    }
  },

  // 1. PUT /api/session/end-early
  endEarlySession: async (token: string): Promise<any> => {
    if (!token) throw new Error("Token is required");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/end-early`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message?.messageDetail || "End early session failed");
      }
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out");
      } else if (error instanceof TypeError) {
        throw new Error("Network error");
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("An unknown error occurred during end early session");
      }
    }
  },

  // 2. POST /api/session
  createSession: async (token: string, body: { subject: string; durationMinutes: number; aiEnabled?: boolean }): Promise<any> => {
    if (!token) throw new Error("Token is required");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${API_BASE_URL}/api/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body), // giữ nguyên giá trị aiEnabled truyền vào
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message?.messageDetail || "Create session failed");
      }
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out");
      } else if (error instanceof TypeError) {
        throw new Error("Network error");
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("An unknown error occurred during create session");
      }
    }
  },

  // 3. POST /api/penalty-rules/apply-penalty
  applyPenalty: async (token: string, body: { sessionId: string; duration: number }): Promise<any> => {
    if (!token) throw new Error("Token is required");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${API_BASE_URL}/api/penalty-rules/apply-penalty`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message?.messageDetail || "Apply penalty failed");
      }
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out");
      } else if (error instanceof TypeError) {
        throw new Error("Network error");
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("An unknown error occurred during apply penalty");
      }
    }
  },
};
