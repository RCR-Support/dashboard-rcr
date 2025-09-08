import { DefaultSession } from "next-auth"
import { RoleEnum } from "@prisma/client"

declare module "next-auth" {
  interface JWT {
    id: string
    roles: RoleEnum[]
    company?: {
      id: string
      name: string
      phone: string
      rut: string
      status: boolean
      url: string | null
      city: string | null
    }
  }
  
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image: string
      roles: RoleEnum[]
      company?: {
        id: string
        name: string
        phone: string
        rut: string
        status: boolean
        url: string | null
        city: string | null
      }
    }
  }

  interface User {
    id: string
    email: string
    name: string
    image: string
    roles: RoleEnum[]
    company?: {
      id: string
      name: string
      phone: string
      rut: string
      status: boolean
      url: string | null
      city: string | null
    }
  }
}
