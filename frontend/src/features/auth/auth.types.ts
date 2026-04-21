export interface JwtPayload {
  id: string;
  role: string;
  email: string;
}

export interface AuthUser {
  _id: string;
  email: string;
  role: string;
  accountStatus: 'active' | 'pending' | 'suspended';
  departmentId?: string;
  profile: any;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: AuthUser;
}
