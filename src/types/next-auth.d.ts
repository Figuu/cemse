import { UserRole, Profile, InstitutionType } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
      profile?: Profile | null;
      institutionType?: InstitutionType | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    profile?: Profile | null;
    institutionType?: InstitutionType | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    profile?: Profile | null;
    institutionType?: InstitutionType | null;
  }
}
