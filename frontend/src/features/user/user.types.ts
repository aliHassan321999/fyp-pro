export interface User {
  _id: string;
  username: string;
  email: string;
  isActive: boolean;
  roleId: string;
  profile?: {
    fullName?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetUsersResponse {
  success: boolean;
  data: User[];
  total: number;
}
