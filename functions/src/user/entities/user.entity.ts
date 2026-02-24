export class User {
  id: string;
  email: string;
  name?: string;
  surname?: string;
  photo?: string;
  emailVerified?: boolean;
  createdAt: Date;
}
