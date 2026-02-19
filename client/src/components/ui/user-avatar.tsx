import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
}

export const UserAvatar = ({ src, alt, className }: UserAvatarProps) => {
  return (
    <div
      className={cn(
        "w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center",
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt || "User avatar"}
          className="h-full w-full object-cover"
        />
      ) : (
        <User className="w-5 h-5 text-slate-400" />
      )}
    </div>
  );
};
