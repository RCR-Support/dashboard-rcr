import { DefaultSession } from "next-auth";
import "next-auth/jwt";
import { RoleEnum } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      roles?: RoleEnum[];
    } & DefaultSession["user"];
  }

  interface User {
    roles?: RoleEnum[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles?: RoleEnum[];
  }
}
