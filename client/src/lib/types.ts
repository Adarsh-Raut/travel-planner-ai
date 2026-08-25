export interface PublicUser {
  id: string;
  name?: string;
  email: string;
  createdAt: string;
}

export interface ValidationIssue {
  path: string;
  message: string;
}
