export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  active: boolean;
  departmentName?: string;
  departmentId?: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  departmentId?: string;
  roleName?: string;
}

export interface AdminCreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  roleName?: string;
  departmentId?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  departmentId?: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  systemRole: boolean;
  permissions: string[];
}

export interface DepartmentResponse {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface DepartmentRequest {
  name: string;
  description?: string;
}
