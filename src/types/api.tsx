export interface LoginResponse {
  result: "ok" | "error";
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}