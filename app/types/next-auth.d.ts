import { DefaultSession } from "next-auth"
import { RoleEnum } from "@prisma/client"

// Extender el módulo next-auth
declare module "next-auth" {
  /**
   * Extiende la interfaz Session para incluir id y roles del usuario
   */
  interface Session {
    user: {
      id: string;
      roles: RoleEnum[];
    } & DefaultSession["user"]
  }

  /**
   * Extiende la interfaz User para incluir roles
   */
  interface User {
    id: string;
    roles: RoleEnum[];
  }
}

// Extiende el módulo next-auth/jwt
declare module "next-auth/jwt" {
  /**
   * Extiende la interfaz JWT para incluir roles
   */
  interface JWT {
    id: string;
    roles: RoleEnum[];
  }
}

// Extiende el módulo @auth/core/adapters
declare module "@auth/core/adapters" {
  /**
   * Extiende la interfaz AdapterUser para incluir roles
   */
  interface AdapterUser {
    id: string;
    roles: RoleEnum[];
  }
}

// Exportar tipos auxiliares para uso en la aplicación
export type AuthUser = {
  id: string;
  roles: RoleEnum[];
  email: string;
  name?: string;
}
