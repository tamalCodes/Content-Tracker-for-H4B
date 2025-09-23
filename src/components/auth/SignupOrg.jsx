import { strongPassword } from "@utils/auth/authUtils";
import { useState } from "react";
import PasswordHints from "./PasswordHints";

export default function SignupOrg({ email, onBack }) {
  const [org, setOrg] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState(null);
  const [showPwd, setShowPwd] = useState(false);

  const checks = strongPassword(pwd);
  const disabled = !org.trim() || !checks.ok;

  const submit = () => {
    setErr(null);
    if (!org.trim()) {
      setErr("Organization name is required");
      return;
    }
    if (!checks.ok) {
      setErr("Password does not meet requirements");
      return;
    }
    // Front-end only. Wire API later.
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Set up your organization</h2>
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
          <span className="text-xs text-neutral-400">Work email</span>
          <input
            value={email}
            disabled
            className="h-11 disabled:cursor-not-allowed rounded-xl bg-neutral-950 border border-neutral-800 px-3 text-neutral-400"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs text-neutral-400">Organization name</span>
          <input
            type="text"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            className="h-11 rounded-xl bg-neutral-950 border border-neutral-700 px-3 outline-none"
            placeholder="Your company or team"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs text-neutral-400">Password</span>
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
              className="absolute inset-y-0 right-3 flex items-center text-xs text-neutral-400 hover:text-neutral-200"
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>
          <PasswordHints pwd={pwd} />
        </label>

        {err && <p className="text-xs text-rose-400">{err}</p>}

        <button
          disabled={disabled}
          className="h-11 cursor-pointer disabled:cursor-not-allowed rounded-xl bg-neutral-100 text-neutral-900 font-medium disabled:opacity-50 hover:bg-white focus:outline-none"
        >
          Create organization
        </button>
      </form>
    </div>
  );
}
