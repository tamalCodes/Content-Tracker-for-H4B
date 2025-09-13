import clsx from "clsx";
import { addDays, format, isToday, startOfWeek, subDays } from "date-fns";
import React, { useEffect, useState } from "react";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSelectedDate,
  setSelectedDate,
} from "../../store/slices/globalSlice";
import { getTaskTop } from "../../utils/Calendar";
import Task from "../calendar/Task";
import TaskPopup from "../calendar/TaskPopup";

const CalendarLarge = ({ tasks }) => {
  const dispatch = useDispatch();
  const selectedDate = useSelector(selectSelectedDate);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday

  // Detect mobile on mount and resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const suffix = i < 12 ? "AM" : "PM";
    return `${hour} ${suffix}`;
  });

  // Auto-update current time (every 30s)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to current time
  useEffect(() => {
    const container = document.getElementById("calendar-scroll-container");
    if (container) {
      const top = getTaskTop(currentTime);
      container.scrollTop = top - 20;
    }
  }, [currentTime]);

  const renderHeader = () => {
    const days = [];
    const totalDays = isMobile ? 3 : 5;

    // Time column placeholder
    days.push(
      <div
        key="time-label"
        className="border-r border-[#ffffff2f] md:w-[70px] w-[50px]"
      />
    );

    // Start from selectedDate instead of weekStart
    let currentDate = new Date(selectedDate);

    for (let i = 0; i < totalDays; i++) {
      const isTodayDate = isToday(currentDate);
      days.push(
        <div
          key={i}
          className="flex-1 flex flex-col items-center justify-center py-2 border-r border-[#ffffff2f] text-sm font-medium"
        >
          <div>{format(currentDate, "EEE")}</div>
          <div
            className={`text-[20px] w-9 h-9 flex items-center justify-center rounded-full ${
              isTodayDate ? "bg-[#a8c9fb] text-black" : ""
            }`}
          >
            {format(currentDate, "d")}
          </div>
        </div>
      );
      currentDate = addDays(currentDate, 1);
    }

    return (
      <div className="flex w-full border-b border-[#ffffff2f]">{days}</div>
    );
  };

  // Render grid (time slots + tasks)
  const renderGrid = () => {
    const totalDays = isMobile ? 3 : 5;

    return (
      <div className="flex w-full">
        {[...Array(totalDays + 1)].map((_, dayIndex) => {
          // +1 for time column
          const isTimeColumn = dayIndex === 0;

          if (isTimeColumn) {
            return (
              <div
                key="time-col"
                className="md:w-[70px] w-[50px] flex flex-col border-r border-[#ffffff2f]"
              >
                {hours.map((time, idx) => (
                  <div
                    key={idx}
                    className="h-[50px] text-right pr-2 text-xs text-[#c6c6c68c] relative top-[-26px] flex items-center justify-end"
                  >
                    {time === "12 AM" ? "" : time}
                  </div>
                ))}
              </div>
            );
          }

          const date = addDays(new Date(selectedDate), dayIndex - 1);
          const dayTasks = tasks.filter((task) => {
            const taskDate = new Date(task.date);
            return (
              taskDate.getDate() === date.getDate() &&
              taskDate.getMonth() === date.getMonth() &&
              taskDate.getFullYear() === date.getFullYear()
            );
          });

          console.log(dayTasks);

          return (
            <div
              key={dayIndex}
              className="flex-1 flex flex-col border-r border-[#ffffff2f] relative"
            >
              {hours.map((_, timeIndex) => (
                <div
                  key={timeIndex}
                  className="h-[50px] border-b border-[#ffffff2f]"
                />
              ))}

              {isToday(new Date(selectedDate)) && dayIndex === 1 && (
                <>
                  <div
                    className="absolute left-0 right-0 h-[2px] bg-[#f65f58] z-50"
                    style={{ top: `${getTaskTop(currentTime)}px` }}
                  />
                  <div
                    className="absolute w-3 h-3 bg-[#f65f58] rounded-full z-50"
                    style={{
                      top: `${getTaskTop(currentTime) - 5}px`,
                      left: "-6px",
                    }}
                  />
                </>
              )}

              {dayTasks.map((task) => (
                <Task
                  key={task.id}
                  task={task}
                  setPopupPos={setPopupPos}
                  setSelectedTask={setSelectedTask}
                />
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const navigateDays = (direction) => {
    const daysToNavigate = isMobile ? 3 : 5;
    const newDate =
      direction === "next"
        ? addDays(selectedDate, daysToNavigate)
        : subDays(selectedDate, daysToNavigate);

    dispatch(setSelectedDate(newDate.toISOString()));
  };

  return (
    <div
      className={clsx(
        "w-full font-outfit text-[#c6c6c6]",
        isMobile && "relative"
      )}
    >
      {renderHeader()}

      <div className="flex justify-between my-2 absolute w-full z-99 top-[10px]">
        <button
          onClick={() => navigateDays("prev")}
          className="text-[22px] w-[30px] h-[30px] md:w-[35px] md:h-[35px] flex items-center justify-center text-white md:p-[1px] p-[2px] bg-[#000000] rounded absolute top-[10px] md:top-[44px] md:left-[54px] -left-[10px] cursor-pointer"
        >
          <RxCaretLeft />
        </button>

        <button
          onClick={() => navigateDays("next")}
          className="text-[22px] w-[30px] h-[30px] md:w-[35px] md:h-[35px] flex items-center justify-center text-white md:p-[1px] p-[2px] bg-[#000] rounded absolute top-[10px] md:top-[44px] md:right-[349px] -right-[22px] cursor-pointer"
        >
          <RxCaretRight />
        </button>
      </div>

      <div
        id="calendar-scroll-container"
        className={clsx(
          "overflow-y-auto",
          isMobile ? " max-h-[calc(100vh-95px)]" : " max-h-[calc(100vh-150px)]"
        )}
      >
        {renderGrid()}
      </div>
      <TaskPopup
        task={selectedTask}
        position={popupPos}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
};

export default CalendarLarge;
