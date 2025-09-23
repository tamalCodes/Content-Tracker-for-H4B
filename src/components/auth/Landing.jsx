import { isGenericDomain, isValidEmail } from "@utils/auth/authUtils";
import { useState } from "react";
import OAuthGoogleButton from "./OAuthGoogleButton";

export default function Landing({ onResolved }) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const disabled = !isValidEmail(email) || loading;

  const handleContinue = async () => {
    setErr(null);
    if (!isValidEmail(email)) {
      setErr("Enter a valid email");
      return;
    }
    setLoading(true);

    try {
      // 1) Call your backend status check here:
      // const { exists } = await api.statusCheck(email);
      // if (exists) return onResolved({ name: "existing_password", email });

      // 2) If not existing user, branch by domain type:
      if (isGenericDomain(email)) {
        onResolved({ name: "signup_generic", email });
      } else {
        onResolved({ name: "signup_org", email });
      }
    } catch (e) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-outfit">
      <h2 className="text-lg font-semibold">Welcome</h2>
      <p className="mt-1 text-sm text-neutral-400">
        Use Google or your email to get started
      </p>

      <div className="mt-[3rem] grid gap-4">
        <OAuthGoogleButton />

        <div className="relative text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800" />
          </div>
          <div className="relative inline-block bg-[#121212] px-2 leading-[12px] text-xs text-neutral-500">
            OR
          </div>
        </div>

        <form
          className="grid gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleContinue();
          }}
        >
          <label className="grid gap-1">
            <span className="text-xs text-neutral-400">Email</span>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl bg-neutral-950 border border-neutral-700 px-3 outline-none"
              placeholder="you@example.com"
            />
          </label>

          {err && <p className="text-xs text-rose-400">{err}</p>}

          <button
            disabled={disabled}
            className="h-11 cursor-pointer disabled:cursor-not-allowed rounded-xl bg-neutral-100 text-neutral-900 font-medium disabled:opacity-50  hover:bg-white focus:outline-none "
          >
            {loading ? "Checking…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
