export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  userId: string;
  accessToken: string;
}

export class LoginUserUseCase {
  async execute(request: LoginUserRequest): Promise<LoginUserResponse> {
    // TODO: Implementar con Supabase Auth
    // 1. Autenticar con Supabase
    // 2. Retornar datos de sesión

    return {
      userId: '',
      accessToken: '',
    };
  }
}
