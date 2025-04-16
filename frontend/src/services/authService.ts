import { api } from "./api";

interface Nutritionist {
  id: string;
  name: string;
  email: string;
  crn?: string;
  clinicName?: string;
}

interface LoginResponse {
  access_token: string;
  nutritionist: Nutritionist;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterNutritionistDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  crn?: string;
  specialties?: string[];
  clinicName?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>(
        "/auth/login",
        credentials
      );

      return response.data;
    } catch (error) {
      console.error("Login Request - Error:", error);
      throw error;
    }
  },

  async register(data: RegisterNutritionistDto): Promise<Nutritionist> {
    const response = await api.post<Nutritionist>("/nutritionists", data);
    return response.data;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("@smartnutri:token");
  },

  getToken(): string | null {
    return localStorage.getItem("@smartnutri:token");
  },

  getUser(): Nutritionist | null {
    const user = localStorage.getItem("@smartnutri:user");
    return user ? JSON.parse(user) : null;
  },

  logout(): void {
    localStorage.removeItem("@smartnutri:token");
    localStorage.removeItem("@smartnutri:user");
    window.location.href = "/login";
  },
};
