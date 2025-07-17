// Message object chung
export interface SessionMessage {
  messageCode: string;
  messageDetail: string;
}

// Error object chung
export interface SessionError {
  field: string;
  message: string;
}

// 1. GET /api/session/weakly-session
export interface WeeklySessionDataItem {
  date: string; // YYYY-MM-DD
  totalDuration: number;
}

export type WeeklySessionData = WeeklySessionDataItem[];

export interface WeeklySessionResponse {
  isSuccess: boolean;
  message: SessionMessage;
  errors: SessionError[];
  data: WeeklySessionData | {};
}

// 2. GET /api/session/user
export interface SessionUserItem {
  id: string;
  username: string;
  startTime: string;
  endTime: string;
  status: string;
  duration: number;
  subject: string;
  focusScore: number;
  penaltyPoints: number;
}

export interface SessionUserSortRequest {
  direction: string;
  field: string;
}

export interface SessionUserRequest {
  page: number;
  size: number;
  sortRequest: SessionUserSortRequest;
}

export interface SessionUserData {
  content: SessionUserItem[];
  request: SessionUserRequest;
  totalElement: number;
}

export interface SessionUserResponse {
  isSuccess: boolean;
  message: SessionMessage;
  errors: SessionError[];
  data: SessionUserData | {};
}

// 3. GET /api/session/subject-count
export interface SubjectCountItem {
  subject: string;
  count: number;
}

export type SubjectCountData = SubjectCountItem[];

export interface SubjectCountResponse {
  isSuccess: boolean;
  message: SessionMessage;
  errors: SessionError[];
  data: SubjectCountData | {};
}

// 4. GET /api/session/stasisc-hours-rule
export interface SessionRole {
  name: string;
}

export interface SessionProfile {
  nickName: string | null;
  fullName: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  avatar: string | null;
  gender: string | null;
  id: string;
  createdBy: string | null;
  updatedBy: string | null;
  createdDate: string;
  updatedDate: string;
}

export interface SessionUser {
  username: string;
  password: string;
  email: string;
  status: string;
  isDeleted: boolean;
  role: SessionRole;
  profile: SessionProfile;
  id: string;
  createdBy: string | null;
  updatedBy: string | null;
  createdDate: string;
  updatedDate: string;
}

export interface StasiscHoursRuleData {
  user: SessionUser;
  totalHours: number;
  totalSessions: number;
  totalRules: number;
}

export interface StasiscHoursRuleResponse {
  isSuccess: boolean;
  message: SessionMessage;
  errors: SessionError[];
  data: StasiscHoursRuleData | {};
}

// 5. PUT /api/session/end-early
export interface EndEarlySessionResponse {
  isSuccess: boolean;
  message: SessionMessage;
  errors: SessionError[];
  data: SessionUserItem | {};
}

// 6. POST /api/session (create session)
export interface CreateSessionRequest {
  subject: string;
  durationMinutes: number;
  aiEnabled?: boolean;
}
export interface CreateSessionResponse {
  isSuccess: boolean;
  message: SessionMessage;
  errors: SessionError[];
  data: SessionUserItem | {};
}

// 7. POST /api/penalty-rules/apply-penalty
export interface Penalty {
  name: string;
  description: string;
  penaltyPoints: number;
  isActive: boolean;
  ruleType: string;
  id: string;
  createdBy: string;
  updatedBy: string;
  createdDate: string;
  updatedDate: string;
}
export interface ApplyPenaltyRequest {
  sessionId: string;
  duration: number;
}
export interface ApplyPenaltyResponse {
  isSuccess: boolean;
  message: SessionMessage;
  errors: SessionError[];
  data: (SessionUserItem & { penalties?: Penalty[] }) | {};
}
