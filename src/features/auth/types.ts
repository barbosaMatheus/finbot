export type User = {
  id: string;
  email: string;
};

export type AuthSession = {
  user: User;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = LoginCredentials;

export type AuthResponse = {
  user: User;
};
