import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { paymentApi } from "../services/paymentApi";
import { PaymentRequest, PaymentResponse, PaymentConfirmResponse, PointResponse, PointData, PaymentHistoryItem, PaymentHistoryResponse } from "../types/payment";

interface PaymentStoreState {
  paymentResult: PaymentResponse | null;
  confirmResult: PaymentConfirmResponse | null;
  point: number;
  paymentHistory: PaymentHistoryItem[];
  totalElement: number;
  loading: boolean;
  error: string | null;
  createPayment: (amount: number) => Promise<void>;
  confirmPayment: () => Promise<void>;
  getPoint: () => Promise<void>;
  getPaymentHistory: (query?: { page?: number; size?: number; field?: string; direction?: string }) => Promise<void>;
  reset: () => void;
}

export const usePaymentStore = create<PaymentStoreState>((set) => ({
  paymentResult: null,
  confirmResult: null,
  point: 0,
  paymentHistory: [],
  totalElement: 0,
  loading: false,
  error: null,

  createPayment: async (amount: number) => {
    set({ loading: true, error: null });
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token available");
      const body: PaymentRequest = { amount };
      const result = await paymentApi.createPayment(token, body);
      set({ paymentResult: result, loading: false });
    } catch (error: any) {
      set({ error: error.message || "Payment failed", loading: false });
    }
  },

  confirmPayment: async () => {
    set({ loading: true, error: null });
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token available");
      const result = await paymentApi.confirmPayment(token);
      set({ confirmResult: result, loading: false });
    } catch (error: any) {
      set({ error: error.message || "Confirm payment failed", loading: false });
    }
  },

  getPoint: async () => {
    set({ loading: true, error: null });
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token available");
      const result = await paymentApi.getPoint(token);
      set({ point: result.data && typeof result.data.point === 'number' ? result.data.point : 0, loading: false });
    } catch (error: any) {
      set({ error: error.message || "Get point failed", loading: false });
    }
  },

  getPaymentHistory: async (query) => {
    set({ loading: true, error: null });
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token available");
      const result = await paymentApi.getPaymentHistory(token, query);
      if (result.data && (result.data as any).content) {
        set({ paymentHistory: (result.data as any).content, totalElement: (result.data as any).totalElement, loading: false });
      } else {
        set({ paymentHistory: [], totalElement: 0, loading: false });
      }
    } catch (error: any) {
      set({ error: error.message || "Get payment history failed", loading: false });
    }
  },

  reset: () => {
    set({ paymentResult: null, confirmResult: null, point: 0, paymentHistory: [], totalElement: 0, loading: false, error: null });
  },
}));
