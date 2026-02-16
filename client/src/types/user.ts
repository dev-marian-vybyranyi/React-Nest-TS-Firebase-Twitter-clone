export interface User {
  uid: string;
  email: string;
  name: string;
  surname: string;
  photo?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

export interface UpdateUser {
  name?: string;
  surname?: string;
  photo?: string;
}
