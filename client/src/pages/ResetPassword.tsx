import AuthInput from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/firebase";
import { ResetPasswordSchema } from "@/schemas/auth";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { Form, Formik } from "formik";
import { CheckCircle2, Lock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

type Status = "verifying" | "valid" | "invalid" | "success";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode") || "";

  const [status, setStatus] = useState<Status>("verifying");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!oobCode) {
      setStatus("invalid");
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setEmail(email);
        setStatus("valid");
      })
      .catch(() => setStatus("invalid"));
  }, [oobCode]);

  const handleResetSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await confirmPasswordReset(auth, oobCode, values.password);
      setStatus("success");
    } catch (error) {
      toast.error("Failed to reset password. The link may have expired.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-[400px] shadow-lg bg-white">
        {status === "verifying" && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                Reset Password
              </CardTitle>
              <CardDescription>Verifying your reset link…</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            </CardContent>
          </>
        )}

        {status === "invalid" && (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <XCircle className="h-14 w-14 text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-500">
                Link Expired
              </CardTitle>
              <CardDescription>
                This reset link is invalid or has already been used.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full text-white"
                onClick={() => navigate("/sign-in")}
              >
                Back to Sign In
              </Button>
            </CardContent>
          </>
        )}

        {status === "valid" && (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <Lock className="h-12 w-12" />
              </div>
              <CardTitle className="text-2xl font-bold">New Password</CardTitle>
              <CardDescription>
                Setting a new password for{" "}
                <span className="font-medium text-slate-700">{email}</span>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Formik
                initialValues={{ password: "", confirmPassword: "" }}
                validationSchema={ResetPasswordSchema}
                onSubmit={handleResetSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="flex flex-col gap-4">
                    <AuthInput
                      label="New Password"
                      name="password"
                      type="password"
                      placeholder="Min. 6 characters"
                    />
                    <AuthInput
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      placeholder="Repeat your password"
                    />

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-black hover:bg-gray-800 text-white"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Resetting...
                        </span>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </>
        )}

        {/* СТАН: УСПІХ */}
        {status === "success" && (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <CheckCircle2 className="h-14 w-14 text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                Password Reset!
              </CardTitle>
              <CardDescription>
                Your password has been changed successfully.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => navigate("/sign-in")}
              >
                Sign In
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default ResetPassword;
