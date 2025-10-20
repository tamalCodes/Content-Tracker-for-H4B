import { logoutUser as requestLogout } from "@api/auth";
import Calendar from "@components/home/Calendar";
import CalendarLegends from "@components/home/CalendarLegends";
import {
  clearCredentials,
  clearPersistedCredentials,
  selectProfile,
} from "@store/slices/profileSlice";
import { useMemo, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector(selectProfile);
  const [loggingOut, setLoggingOut] = useState(false);

  const { displayName, initial, emailLabel } = useMemo(() => {
    const primary =
      user?.organizationName?.trim() ||
      user?.name?.trim?.() ||
      user?.email?.split("@")[0] ||
      "User";
    const derivedInitial = primary?.charAt(0)?.toUpperCase() || "U";
    return {
      displayName: primary,
      initial: derivedInitial,
      emailLabel: user?.email || "",
    };
  }, [user]);

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }
    setLoggingOut(true);
    let hadError = false;
    try {
      if (token) {
        await requestLogout(token);
      }
    } catch (error) {
      console.error("Failed to logout:", error);
      hadError = true;
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to logout user"
      );
    } finally {
      dispatch(clearCredentials());
      clearPersistedCredentials();
      setLoggingOut(false);
      if (!hadError) {
        toast.success("You have been logged out");
      }
      navigate("/auth", { replace: true });
    }
  };

  return (
    <div className="hidden md:flex w-[280px] flex-col gap-[2rem] min-h-[calc(100vh-3rem)]">
      <div className="flex flex-col gap-[2rem] flex-1">
        <Calendar mode={"view"} />
        <button
          type="button"
          className="flex items-center justify-center text-white text-[18px] font-outfit gap-[10px] bg-[#39383b] rounded-md cursor-pointer p-2 transition hover:bg-[#4c4b4e]"
          onClick={() => navigate("/create")}
        >
          <IoMdAdd /> Schedule Post
        </button>
        <CalendarLegends />
      </div>

      <div className="mt-auto">
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-[#1c1c1c] px-3 py-3">
          <div className="flex h-8 w-8 min-h-8 min-w-8 items-center justify-center rounded-full bg-neutral-700 text-base font-semibold uppercase text-neutral-100">
            {initial}
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-sm font-medium text-neutral-100">
              {displayName}
            </span>
            {emailLabel && (
              <span className="text-xs text-neutral-400 truncate">
                {emailLabel}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 rounded-lg aspect-square cursor-pointer bg-[#2a2a2a] px-3 py-2 text-sm font-medium text-neutral-200 transition hover:bg-[#353535] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Logout"
          >
            <FiLogOut />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
