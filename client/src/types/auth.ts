export interface SignUpFormValues {
  name: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignInFormValues {
  email: string;
  password: string;
}

export interface User {
  uid: string;
  email: string;
  name?: string;
  surname?: string;
  photo?: string;
}
