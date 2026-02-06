import { createClient } from '@/lib/infrastructure/database/supabase/server';
import { User } from '@/lib/domain/entities/User';
import { IUserRepository } from '@/lib/domain/repositories/IUserRepository';
import { DatabaseError } from '@/lib/shared/errors/AppError';

export class SupabaseUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    // Nota: el email está en auth.users, necesitamos buscar a través de la relación
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async save(user: User): Promise<void> {
    const supabase = createClient();
    const dbData = this.toDatabase(user);

    const { error } = await supabase.from('profiles').insert(dbData);

    if (error) throw new DatabaseError(error.message);
  }

  async update(user: User): Promise<void> {
    const supabase = createClient();
    const dbData = this.toDatabase(user);

    const { error } = await supabase
      .from('profiles')
      .update(dbData)
      .eq('id', user.id);

    if (error) throw new DatabaseError(error.message);
  }

  private toDomain(data: Record<string, unknown>): User {
    return new User({
      id: data.id as string,
      email: '', // Email está en auth.users
      fullName: data.full_name as string,
      phone: data.phone as string | undefined,
      country: data.country as string,
      kycStatus: data.kyc_status as User['kycStatus'],
      kycLevel: data.kyc_level as number,
      kycData: data.kyc_data as Record<string, unknown> | undefined,
      metadata: data.metadata as Record<string, unknown> | undefined,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    });
  }

  private toDatabase(user: User): Record<string, unknown> {
    return {
      id: user.id,
      full_name: user.fullName,
      phone: user.phone,
      country: user.country,
      kyc_status: user.kycStatus,
      kyc_level: user.kycLevel,
      kyc_data: user.kycData,
      metadata: user.metadata,
    };
  }
}
