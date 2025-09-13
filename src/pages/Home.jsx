import React, { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllContents } from "../api/queries";
import Calendar from "../components/home/Calendar";
import CalendarLarge from "../components/home/CalendarLarge";
import CalendarLegends from "../components/home/CalendarLegends";
import { selectReRenderSwitch } from "../store/slices/globalSlice";

const Home = () => {
  const [contents, setContents] = useState([]); // State to store contents
  const reRenderSwitch = useSelector(selectReRenderSwitch);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const data = await getAllContents();
        setContents(data);
      } catch (error) {
        console.error("Error fetching contents:", error);
      }
    };

    fetchContents();
  }, [reRenderSwitch]);

  const year = 2025;
  const calendarData2025 = [];

  for (let month = 0; month < 12; month++) {
    // 0 = January, 11 = December
    // First day of the month
    const firstDayOfMonth = new Date(year, month, 1);

    // Get the full weekday name using toLocaleString
    const startDayOfWeek = firstDayOfMonth.toLocaleString("default", {
      weekday: "long",
    });

    // Last day of the month (by getting day 0 of the *next* month)
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Number of days in the month
    const daysInMonth = lastDayOfMonth.getDate();

    calendarData2025.push({
      year: year,
      month: month, // 0-indexed
      monthName: firstDayOfMonth.toLocaleString("default", { month: "long" }),
      daysInMonth: daysInMonth,
      startDayOfWeek: startDayOfWeek,
    });
  }

  return (
    <div className="overflow-y-hidden h-screen">
      <div className="flex items-start gap-[2rem] md:p-5 p-3">
        <div className=" flex-col gap-[2rem] hidden md:flex">
          <Calendar mode={"view"} />
          <div
            className="flex items-center space-x-6 rtl:space-x-reverse w-full"
            onClick={() => {
              navigate("/create");
            }}
          >
            <div className="text-white text-[18px] font-outfit flex items-center gap-[10px] bg-[#39383b]  w-full rounded-md cursor-pointer justify-center p-2">
              <IoMdAdd /> Schedule Post
            </div>
          </div>

          <CalendarLegends />
        </div>

        <div className="w-full md:p-5 pr-3 rounded-[20px] bg-[#131313]">
          <CalendarLarge tasks={contents} />
        </div>
      </div>
    </div>
  );
};

export default Home;
