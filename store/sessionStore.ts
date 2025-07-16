import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sessionApi } from "../services/sessionApi";
import {
  WeeklySessionResponse,
  WeeklySessionData,
  SessionUserResponse,
  SessionUserData,
  SubjectCountResponse,
  SubjectCountData,
  StasiscHoursRuleResponse,
  StasiscHoursRuleData,
  EndEarlySessionResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  ApplyPenaltyRequest,
  ApplyPenaltyResponse,
} from "../types/session";

interface SessionStoreState {
  weeklySession: WeeklySessionData | [];
  sessionUser: SessionUserData | null;
  subjectCount: SubjectCountData | [];
  stasiscHoursRule: StasiscHoursRuleData | null;
  loading: boolean;
  error: string | null;
  getWeeklySession: () => Promise<void>;
  getSessionUser: (query?: { page?: number; size?: number; field?: string; direction?: string }) => Promise<void>;
  getSubjectCount: () => Promise<void>;
  getStasiscHoursRule: () => Promise<void>;
  reset: () => void;
  endEarlySession: () => Promise<EndEarlySessionResponse | null>;
  createSession: (body: CreateSessionRequest) => Promise<CreateSessionResponse | null>;
  applyPenalty: (body: ApplyPenaltyRequest) => Promise<ApplyPenaltyResponse | null>;
}

export const useSessionStore = create<SessionStoreState>((set) => ({
  weeklySession: [],
  sessionUser: null,
  subjectCount: [],
  stasiscHoursRule: null,
  loading: false,
  error: null,

  getWeeklySession: async () => {
    set({ loading: true, error: null });
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token available");
      const result: WeeklySessionResponse = await sessionApi.getWeeklySession(token);
      set({ weeklySession: Array.isArray(result.data) ? result.data : [], loading: false });
    } catch (error: any) {
      set({ error: error.message || "Get weekly session failed", loading: false });
    }
  },

  getSessionUser: async (query) => {
    set({ loading: true, error: null });
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token available");
      const result: SessionUserResponse = await sessionApi.getSessionUser(token, query);
      set({ sessionUser: (result.data && (result.data as any).content) ? result.data as SessionUserData : null, loading: false });
    } catch (error: any) {
      set({ error: error.message || "Get session user failed", loading: false });
    }
  },

  getSubjectCount: async () => {
    set({ loading: true, error: null });
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token available");
      const result: SubjectCountResponse = await sessionApi.getSubjectCount(token);
      set({ subjectCount: Array.isArray(result.data) ? result.data : [], loading: false });
    } catch (error: any) {
      set({ error: error.message || "Get subject count failed", loading: false });
    }
  },

  getStasiscHoursRule: async () => {
    set({ loading: true, error: null });
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token available");
      const result: StasiscHoursRuleResponse = await sessionApi.getStasiscHoursRule(token);
      if (result && result.data) {
      } else {
      }
      set({
        stasiscHoursRule:
          result.data && Object.keys(result.data).length > 0
            ? (result.data as StasiscHoursRuleData)
            : null,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message || "Get stasisc hours rule failed", loading: false });
    }
  },

  reset: () => {
    set({
      weeklySession: [],
      sessionUser: null,
      subjectCount: [],
      stasiscHoursRule: null,
      loading: false,
      error: null,
    });
  },

  endEarlySession: async () => {
    set({ loading: true, error: null });
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token available");
      const result: EndEarlySessionResponse = await sessionApi.endEarlySession(token);
      set({ loading: false });
      return result;
    } catch (error: any) {
      set({ error: error.message || "End early session failed", loading: false });
      return {
        isSuccess: false,
        message: { messageCode: 'ERROR', messageDetail: error.message || "End early session failed" },
        errors: [],
        data: {},
      };
    }
  },

  createSession: async (body) => {
    set({ loading: true, error: null });
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token available");
      const result: CreateSessionResponse = await sessionApi.createSession(token, body);
      set({ loading: false });
      return result;
    } catch (error: any) {
      set({ error: error.message || "Create session failed", loading: false });
      return {
        isSuccess: false,
        message: { messageCode: 'ERROR', messageDetail: error.message || "Create session failed" },
        errors: [],
        data: {},
      };
    }
  },

  applyPenalty: async (body) => {
    set({ loading: true, error: null });
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token available");
      const result: ApplyPenaltyResponse = await sessionApi.applyPenalty(token, body);
      set({ loading: false });
      return result;
    } catch (error: any) {
      set({ error: error.message || "Apply penalty failed", loading: false });
      return {
        isSuccess: false,
        message: { messageCode: 'ERROR', messageDetail: error.message || "Apply penalty failed" },
        errors: [],
        data: {},
      };
    }
  },
}));
