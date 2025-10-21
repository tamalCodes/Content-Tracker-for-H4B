import ExistingPassword from "@components/auth/ExistingPassword";
import HeaderLogo from "@components/auth/HeaderLogo";
import Landing from "@components/auth/Landing";
import SignupGeneric from "@components/auth/SignupGeneric";
import SignupOrg from "@components/auth/SignupOrg";
import {
  persistCredentials,
  setCredentials,
} from "@store/slices/profileSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AuthPage() {
  const [step, setStep] = useState({ name: "landing" });
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const provider = params.get("provider");
    const userParam = params.get("user");

    if (!token) {
      return;
    }

    let user = null;
    if (userParam) {
      try {
        const decoded = window.atob(userParam);
        user = JSON.parse(decoded);
      } catch (error) {
        console.error("Failed to parse user payload:", error);
      }
    }

    dispatch(setCredentials({ token, user }));
    persistCredentials({ token, user });
    toast.success(
      provider === "google"
        ? "Signed in with Google"
        : "Sign-in successful"
    );

    params.delete("token");
    params.delete("provider");
    params.delete("user");
    const remaining = params.toString();
    const nextPath = remaining ? `${location.pathname}?${remaining}` : "/";

    navigate(nextPath, { replace: true });
  }, [dispatch, location.pathname, location.search, navigate]);

  return (
    <div className="min-h-screen bg-[#1a1b1b] text-neutral-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <HeaderLogo />
        <div className="mt-[2rem] bg-[#131313] backdrop-blur rounded-2xl shadow-xl border border-neutral-800 p-6">
          {step.name === "landing" && (
            <Landing onResolved={(next) => setStep(next)} />
          )}

          {step.name === "existing_password" && (
            <ExistingPassword
              email={step.email}
              onBack={() => setStep({ name: "landing" })}
            />
          )}

          {step.name === "signup_generic" && (
            <SignupGeneric
              email={step.email}
              onBack={() => setStep({ name: "landing" })}
            />
          )}

          {step.name === "signup_org" && (
            <SignupOrg
              email={step.email}
              onBack={() => setStep({ name: "landing" })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
