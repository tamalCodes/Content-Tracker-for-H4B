import ExistingPassword from "@components/auth/ExistingPassword";
import HeaderLogo from "@components/auth/HeaderLogo";
import Landing from "@components/auth/Landing";
import SignupGeneric from "@components/auth/SignupGeneric";
import SignupOrg from "@components/auth/SignupOrg";
import { useState } from "react";

export default function AuthPage() {
  const [step, setStep] = useState({ name: "landing" });

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
