import { PaymentRequest, PaymentResponse, PaymentConfirmResponse, PointResponse, PaymentHistoryResponse, AddPointRequest, AddPointResponse } from "../types/payment";

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

  addPoint: async (token: string, body: AddPointRequest): Promise<AddPointResponse> => {
    if (!token || !body || typeof body.point !== 'number') {
      throw new Error("Token and point are required");
    }
    console.log('🚀 API Call - addPoint');
    console.log('📤 Request Body:', body);
    console.log('🔑 Token:', token.substring(0, 20) + '...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      // Theo API docs: request body chỉ cần là số nguyên
      const requestBody = body.point;
      
      console.log('📤 Final Request Body:', JSON.stringify(requestBody));
      
      const response = await fetch(`${API_BASE_URL}/api/point/add-point`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Data:', data);
      
      if (!response.ok) {
        console.error('❌ API Error:', data?.message?.messageDetail || "Add point failed");
        console.error('❌ Full Error Response:', data);
        throw new Error(data?.message?.messageDetail || "Add point failed");
      }
      console.log('✅ API Success:', data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ API Exception:', error);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out");
      } else if (error instanceof TypeError) {
        throw new Error("Network error");
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("An unknown error occurred during add point");
      }
    }
  },

  // Alternative format cho API
  addPointAlternative: async (token: string, body: AddPointRequest): Promise<AddPointResponse> => {
    try {
      console.log('🔄 Trying alternative format...');
      
      // Thử format object
      const requestBody = { point: body.point };
      
      const response = await fetch(`${API_BASE_URL}/api/point/add-point`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      console.log('📥 Alternative Response:', data);
      
      if (!response.ok) {
        throw new Error(data?.detail || "Add point failed");
      }
      
      return data;
    } catch (error) {
      console.error('❌ Alternative format also failed:', error);
      throw error;
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
