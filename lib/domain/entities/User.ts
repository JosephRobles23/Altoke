export type KycStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export interface UserProps {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  country: string;
  kycStatus: KycStatus;
  kycLevel: number;
  kycData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly fullName: string;
  public readonly phone?: string;
  public readonly country: string;
  public readonly kycStatus: KycStatus;
  public readonly kycLevel: number;
  public readonly kycData?: Record<string, unknown>;
  public readonly metadata?: Record<string, unknown>;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.fullName = props.fullName;
    this.phone = props.phone;
    this.country = props.country;
    this.kycStatus = props.kycStatus;
    this.kycLevel = props.kycLevel;
    this.kycData = props.kycData;
    this.metadata = props.metadata;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isKycApproved(): boolean {
    return this.kycStatus === 'approved';
  }

  canSendRemittance(): boolean {
    return this.kycLevel >= 1 && this.kycStatus === 'approved';
  }

  static create(props: Omit<UserProps, 'createdAt' | 'updatedAt'>): User {
    return new User({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
