export interface RequestWithUser extends Request {
  user: {
    uid: string;
    email: string;
    [key: string]: any;
  };
}
