export interface UserEntity {
  id: number;
  uuid: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface SignupForm {
  email: string;
  password: string;
}

export interface SigninForm {
  email: string;
  password: string;
}