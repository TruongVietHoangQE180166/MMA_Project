import { PaymentRequest, PaymentResponse, PaymentConfirmResponse, PointResponse, PaymentHistoryResponse } from "../types/payment";

const API_BASE_URL = "https://concentrate-cxcthbapc3bdadh3.southeastasia-01.azurewebsites.net";

export const paymentApi = {
  createPayment: async (token: string, body: PaymentRequest): Promise<PaymentResponse> => {
    if (!token || !body || typeof body.amount !== 'number') {
      throw new Error("Token and amount are required");
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment`, {
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
        throw new Error(data?.message?.messageDetail || "Payment failed");
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
        throw new Error("An unknown error occurred during payment");
      }
    }
  },

  confirmPayment: async (token: string): Promise<PaymentConfirmResponse> => {
    if (!token) {
      throw new Error("Token is required");
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/confirm-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message?.messageDetail || "Confirm payment failed");
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
        throw new Error("An unknown error occurred during confirm payment");
      }
    }
  },

  getPoint: async (token: string): Promise<PointResponse> => {
    if (!token) {
      throw new Error("Token is required");
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${API_BASE_URL}/api/point`, {
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
        throw new Error(data?.message?.messageDetail || "Get point failed");
      }
      return data as PointResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out");
      } else if (error instanceof TypeError) {
        throw new Error("Network error");
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("An unknown error occurred during get point");
      }
    }
  },

  getPaymentHistory: async (
    token: string,
    query?: { page?: number; size?: number; field?: string; direction?: string }
  ): Promise<PaymentHistoryResponse> => {
    if (!token) {
      throw new Error("Token is required");
    }
    const page = query?.page ?? 1;
    const size = query?.size ?? 10;
    const field = query?.field ?? 'createdDate';
    const direction = query?.direction ?? 'desc';
    const url = `${API_BASE_URL}/api/payment?page=${page}&size=${size}&field=${field}&direction=${direction}`;
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
        throw new Error(data?.message?.messageDetail || "Get payment history failed");
      }
      return data as PaymentHistoryResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out");
      } else if (error instanceof TypeError) {
        throw new Error("Network error");
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("An unknown error occurred during get payment history");
      }
    }
  },
};
