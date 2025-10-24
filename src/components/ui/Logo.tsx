import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Logo({ 
  size = "md", 
  showText = true, 
  href = "/",
  className 
}: LogoProps) {
  const logoElement = (
    <div className={cn("flex items-center space-x-2", className)}>
      <Image
        src="/logos/EmpleaEmprende.svg"
        alt="Emplea y Emprende"
        width={32}
        height={32}
        className={cn(sizeClasses[size])}
      />
      {showText && (
        <span className={cn("font-semibold text-gray-700", textSizeClasses[size])}>
          Emplea y Emprende
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {logoElement}
      </Link>
    );
  }

  return logoElement;
}
