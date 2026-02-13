import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useField } from "formik";
import type { LucideIcon } from "lucide-react";

interface AuthInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  icon?: LucideIcon;
  className?: string;
}

export const AuthInput = ({
  label,
  icon: Icon,
  className,
  ...props
}: AuthInputProps) => {
  const [field, meta] = useField(props);

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={props.name}>{label}</Label>
      <div className="relative">
        <Input
          {...field}
          {...props}
          id={props.name}
          className={cn(
            "pl-10",
            meta.touched &&
              meta.error &&
              "border-red-500 focus-visible:ring-red-500",
          )}
        />
        {Icon && (
          <Icon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        )}
      </div>
      {meta.touched && meta.error ? (
        <div className="text-sm text-red-500">{meta.error}</div>
      ) : null}
    </div>
  );
};
