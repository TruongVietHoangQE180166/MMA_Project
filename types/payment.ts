// Request body cho POST /api/payment
export interface PaymentRequest {
  amount: number;
}

// Message object chung
export interface Message {
  messageCode: string;
  messageDetail: string;
}

// Error object chung
export interface PaymentError {
  field: string;
  message: string;
}

// Role, Profile, User cho payment
export interface PaymentRole {
  name: string;
}

export interface PaymentProfile {
  nickName: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  avatar: string;
  gender: string;
  id: string;
  createdBy: string;
  updatedBy: string;
  createdDate: string;
  updatedDate: string;
}

export interface PaymentUser {
  username: string;
  password: string;
  email: string;
  status: string;
  isDeleted: boolean;
  role: PaymentRole;
  profile: PaymentProfile;
  id: string;
  createdBy: string;
  updatedBy: string;
  createdDate: string;
  updatedDate: string;
}

export interface PaymentDetail {
  user: PaymentUser;
  amount: number;
  paymentMethod: string;
  description: string;
  paymentStatus: string;
  id: string;
  createdBy: string;
  updatedBy: string;
  createdDate: string;
  updatedDate: string;
}

export interface PaymentData {
  qrUrl: string;
  note: string;
  payment: PaymentDetail;
}

// Response cho POST /api/payment
export interface PaymentResponse {
  isSuccess: boolean;
  message: Message;
  errors: PaymentError[];
  data: PaymentData | {};
}

// Response cho POST /api/payment/confirm-payment
export interface PaymentConfirmResponse {
  isSuccess: boolean;
  message: Message;
  errors: PaymentError[];
  data: string | {};
}

// Thêm type cho data của getPoint
export interface PointData {
  id: string;
  point: number;
}

// Response cho GET /api/point
export interface PointResponse {
  isSuccess: boolean;
  message: Message;
  errors: PaymentError[];
  data: PointData;
}

// Lịch sử giao dịch
export interface PaymentHistoryItem {
  id: string;
  paymentMethod: string;
  amount: number;
  paymentStatus: string;
  description: string;
}

export interface PaymentHistorySortRequest {
  direction: string;
  field: string;
}

export interface PaymentHistoryRequest {
  page: number;
  size: number;
  sortRequest: PaymentHistorySortRequest;
}

export interface PaymentHistoryData {
  content: PaymentHistoryItem[];
  request: PaymentHistoryRequest;
  totalElement: number;
}

export interface PaymentHistoryResponse {
  isSuccess: boolean;
  message: Message;
  errors: PaymentError[];
  data: PaymentHistoryData | {};
}
