import { useState } from "react";
import { Link } from "react-router-dom";

export default function ExistingPassword({ email, onBack }) {
  const [pwd, setPwd] = useState("");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Welcome back</h2>
        <button
          onClick={onBack}
          className="text-sm text-neutral-400 hover:text-neutral-200"
        >
          Back
        </button>
      </div>

      <form className="mt-4 grid gap-3" onSubmit={(e) => e.preventDefault()}>
        <label className="grid gap-1">
          <span className="text-xs text-neutral-400">Email</span>
          <input
            value={email}
            disabled
            className="h-11 rounded-xl bg-neutral-950 border border-neutral-800 px-3 text-neutral-400"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-neutral-400">Password</span>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="h-11 rounded-xl bg-neutral-950 border border-neutral-700 px-3 outline-none "
            placeholder="Enter your password"
          />
        </label>
        <button
          disabled
          className="h-11 rounded-xl bg-neutral-100 text-neutral-900 font-medium opacity-50 cursor-not-allowed"
        >
          Sign in
        </button>
      </form>

      <div className="mt-3 text-xs text-right">
        <Link
          to="/forgot"
          className="text-neutral-400 hover:text-neutral-200 underline underline-offset-2"
        >
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
