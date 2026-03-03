export type UserRole = "admin" | "faculty" | "student" | string;

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole | null;
}

export type SortField = "full_name" | "email" | "role" ;
export type SortDirection = "asc" | "desc";
export interface SortState {
  field: SortField;
  direction: SortDirection;
}