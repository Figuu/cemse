"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Menu } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { data: session } = useSession();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "YOUTH":
        return "Joven";
      case "COMPANIES":
        return "Empresa";
      case "INSTITUTION":
        return "Institución";
      case "SUPERADMIN":
        return "Administrador";
      default:
        return role;
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
      {/* Mobile menu button */}
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 xl:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex-1 px-4 flex justify-between items-center">
        {/* Left side - Logo and Welcome message */}
        <div className="flex items-center space-x-4">
          <Logo size="md" showText={true} href="/" className="hidden sm:flex" />
          <Logo size="sm" showText={false} href="/" className="sm:hidden" />
          <div className="hidden md:block">
            <span className="text-sm text-gray-500">
              Bienvenido, {session?.user?.profile?.firstName || session?.user?.email}
            </span>
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="ml-4 flex items-center space-x-4">

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={session?.user?.profile?.avatarUrl || ""} 
                    alt={session?.user?.profile?.firstName || ""} 
                  />
                  <AvatarFallback>
                    {getInitials(
                      session?.user?.profile?.firstName || "",
                      session?.user?.profile?.lastName || ""
                    )}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.profile?.firstName} {session?.user?.profile?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {getRoleDisplayName(session?.user?.role || "")}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
