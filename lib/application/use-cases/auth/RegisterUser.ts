import { User } from '@/lib/domain/entities/User';
import { IUserRepository } from '@/lib/domain/repositories/IUserRepository';
import { ValidationError } from '@/lib/shared/errors/AppError';

export interface RegisterUserRequest {
  email: string;
  fullName: string;
  phone?: string;
  country: string;
}

export interface RegisterUserResponse {
  userId: string;
  walletAddress: string;
}

export class RegisterUserUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    // 1. Verificar que el email no esté registrado
    const existingUser = await this.userRepo.findByEmail(request.email);
    if (existingUser) {
      throw new ValidationError('El email ya está registrado');
    }

    // 2. Crear perfil de usuario
    const user = User.create({
      id: crypto.randomUUID(),
      email: request.email,
      fullName: request.fullName,
      phone: request.phone,
      country: request.country,
      kycStatus: 'pending',
      kycLevel: 0,
    });

    await this.userRepo.save(user);

    // 3. Crear wallet (se implementará con createWallet server action)
    // El wallet se crea automáticamente al hacer login la primera vez
    const walletAddress = 'pending';

    return {
      userId: user.id,
      walletAddress,
    };
  }
}
