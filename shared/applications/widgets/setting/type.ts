export interface User {
  Id: string;
  Email: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export enum SideType {
  User,
  Activation,
}
