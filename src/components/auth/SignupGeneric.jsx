import { strongPassword } from "@utils/auth/authUtils";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import PasswordHints from "./PasswordHints";

export default function SignupGeneric({ email, onBack }) {
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState(null);

  const checks = strongPassword(pwd);

  const submit = () => {
    setErr(null);
    if (!checks.ok) {
      setErr("Password does not meet requirements");
      return;
    }
    // Front-end only. Wire API later.
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Create your account</h2>
        <button
          onClick={onBack}
          className="text-sm text-neutral-400 hover:text-neutral-200"
        >
          Back
        </button>
      </div>

      <form
        className="mt-8 grid gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label className="grid gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Email</span>
          </div>
          <input
            value={email}
            disabled
            className="h-11 rounded-xl bg-neutral-950 border border-neutral-800 px-3 text-neutral-400 disabled:cursor-not-allowed"
          />
        </label>
        <label className="grid gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Password</span>
          </div>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="h-11 w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3 pr-10 outline-none"
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPwd((prev) => !prev)}
              className="absolute cursor-pointer inset-y-0 right-3 flex items-center text-[15px] text-neutral-400 hover:text-neutral-200"
            >
              {showPwd ? <FiEye /> : <FiEyeOff />}
            </button>
          </div>
          <PasswordHints pwd={pwd} />
        </label>
        {err && <p className="text-xs text-rose-400">{err}</p>}
        <button
          disabled={!checks.ok}
          className="h-11  cursor-pointer disabled:cursor-not-allowed rounded-xl bg-neutral-100 text-neutral-900 font-medium disabled:opacity-50 hover:bg-white focus:outline-none "
        >
          Create account
        </button>
      </form>
    </div>
  );
}
