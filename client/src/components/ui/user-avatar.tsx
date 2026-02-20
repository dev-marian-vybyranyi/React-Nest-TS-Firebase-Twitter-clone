import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
  userId?: string;
}

export const UserAvatar = ({
  src,
  alt,
  className,
  userId,
}: UserAvatarProps) => {
  const wrapperClass = cn(
    "w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0",
    className,
  );

  const content = src ? (
    <img
      src={src}
      alt={alt || "User avatar"}
      className="h-full w-full object-cover"
    />
  ) : (
    <User className="w-5 h-5 text-slate-400" />
  );

  if (userId) {
    return (
      <Link to={`/profile/${userId}`} className={wrapperClass}>
        {content}
      </Link>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
};
