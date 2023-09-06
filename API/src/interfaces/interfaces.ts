import { User } from "../models/User";

export type HttpResponse<T> = {
  statusCode: number;
  body: T | string;
}

export interface IUserRepository {
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  addUser(user: User): Promise<User | null>;
}

export interface IUserService {
  getAllUsers(): Promise<HttpResponse<User[]>>;
  getUserById(id: string): Promise<HttpResponse<Omit<User, "password" | "confirmPassword">  | null>>;
  addUser(user: User): Promise<HttpResponse<Omit<User, "password" | "confirmPassword"> | null>>;
}
