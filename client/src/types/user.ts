export interface User {
  uid: string;
  email: string;
  name: string;
  surname: string;
  photo?: string;
  emailVerified?: boolean;
  createdAt?: string;
}
