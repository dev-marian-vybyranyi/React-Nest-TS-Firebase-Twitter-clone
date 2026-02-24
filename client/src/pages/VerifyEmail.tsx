import { auth } from "@/firebase";
import { applyActionCode } from "firebase/auth";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode") || "";

  useEffect(() => {
    if (!oobCode) {
      toast.error("Invalid verification link.");
      navigate("/sign-in");
      return;
    }

    applyActionCode(auth, oobCode)
      .then(async () => {
        if (auth.currentUser) {
          await auth.currentUser.reload();
        }
        toast.success("Email verified successfully! You can now sign in.");
        navigate("/sign-in");
      })
      .catch(() => {
        toast.error("Verification link is invalid or has expired.");
        navigate("/sign-in");
      });
  }, [oobCode, navigate]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-sm">Verifying your email…</p>
      </div>
    </div>
  );
};

export default VerifyEmail;
