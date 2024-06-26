import { User } from "../models/User";

// Authentication
import bcrypt from "bcrypt";

// Interfaces
import { HttpResponse } from "../interfaces/interfaces";
import { IUserRepository, IUserService } from "../interfaces/userInterface";

export const hashPass = async (password: string): Promise<string> => {
  const salt = process.env.BCRYPT_SALT || "10";
  const saltValue = await bcrypt.genSaltSync(parseInt(salt));
  const hash = await bcrypt.hashSync(password, saltValue);
  return hash;
};

export class UserService implements IUserService {
  constructor(
    private readonly userRepository: IUserRepository
  ) {}

  async getAllUsers(): Promise<HttpResponse<User[]>> {
    try {
      const users = await this.userRepository.getAllUsers();

      if (!users)
        return {
          statusCode: 400,
          body: "No users found.",
        };

      return {
        statusCode: 200,
        body: users,
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: `Error: ${error}`,
      };
    }
  }

  async getUserById(
    id: string
  ): Promise<HttpResponse<Omit<User, "password" | "confirmPassword">>> {
    try {
      const user = await this.userRepository.getUserById(id);
      if (!user)
        return {
          statusCode: 404,
          body: "User not found.",
        };

      const { password, ...userWithoutPass } = user;
      password;

      return {
        statusCode: 200,
        body: userWithoutPass,
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: `Error: ${error}`,
      };
    }
  }

  async addUser(
    data: User
  ): Promise<HttpResponse<Omit<User, "password" | "confirmPassword">>> {
    try {
      const userExistsEmail = await this.userRepository.getUserByEmail(data.email);
      const userExistsUsername = await this.userRepository.getUserByUsername(data.username);
      if (userExistsEmail || userExistsUsername)
        return {
          statusCode: 400,
          body: "User already exists.",
        };

      // Hash password
      data.password = await hashPass(data.password);
      data.username = data.username.toLowerCase();

      await this.userRepository.addUser(data);

      return {
        statusCode: 201,
        body: "User created successfully.",
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: `Error: ${error}`,
      };
    }
  }

  async updateUser(
    id: string,
    dataUser: User
  ): Promise<HttpResponse<Omit<User, "password" | "confirmPassword">>> {
    try {
      const userExists = await this.userRepository.getUserById(id);
      if (!userExists)
        return {
          statusCode: 404,
          body: "User not found.",
        };

        if (dataUser.email || dataUser.username) {
              
          const userExistsEmail = dataUser.email 
            ? await this.userRepository.getUserByEmail(dataUser.email)
            : null;
          const userExistsUsername = dataUser.username 
            ? await this.userRepository.getUserByUsername(dataUser.username)
            : null;
    
          if (userExistsEmail && userExistsEmail.id !== id) {
            return {
              statusCode: 400,
              body: "Email already in use.",
            };
          }
    
          if (userExistsUsername && userExistsUsername.id !== id) {
            return {
              statusCode: 400,
              body: "Username already in use.",
            };
          }
        }
      
        if(dataUser.password){
          dataUser.password = await hashPass(dataUser.password);
          
        }
      

      const fields: (keyof Pick<
        User,
        "name" | "username" | "password" | "profile_image" |"email"
      >)[] = ["name", "username", "password", "profile_image", "email"];
      for (const field of fields) {
        if (!dataUser[field]) {
          dataUser[field] = userExists[field]!;
        }
      }

      

      await this.userRepository.updateUser(id, dataUser);

      return {
        statusCode: 200,
        body: "User updated successfully.",
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: `Error: ${error}`,
      };
    }
  }

  async removeUser(
    id: string
  ): Promise<HttpResponse<Omit<User, "password" | "confirmPassword">>> {
    try {
      const userExists = await this.userRepository.getUserById(id);
      if (!userExists)
        return {
          statusCode: 404,
          body: "User not found.",
        };
        
      await this.userRepository.removeUser(id);

      return {
        statusCode: 200,
        body: "User deleted successfully.",
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: `Error: ${error}`,
      };
    }
  }
}
