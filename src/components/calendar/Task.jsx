import React from "react";
import { getTaskHeight, getTaskTop } from "../../utils/Calendar";

const Task = ({ task, setPopupPos, setSelectedTask }) => {
  const startTime = new Date(task.time);
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // Add 10 mins

  const top = getTaskTop(startTime);
  const height = getTaskHeight(startTime, endTime);

  let bgColor = "bg-[#4a90e2]";
  if (task.type === "static") {
    bgColor = "bg-[#044327e2] border border-[#246942]";
  } else if (task.type === "video") {
    bgColor = "bg-[#042f43e2] border border-[#1e4658]";
  } else if (task.type === "live") {
    bgColor = "bg-[#4a1e1ee2] border border-[#663939]";
  }

  return (
    <div
      key={task.id}
      className={`absolute md:left-2 left-[2.5px] cursor-pointer right-2 text-white md:w-auto w-[96%] text-[13px] leading-[14px] rounded-[3px] px-2 py-1 shadow-md ${bgColor} overflow-hidden whitespace-nowrap text-ellipsis`}
      style={{ top: `${top}px`, height: `${height}px` }}
      title={` ${task.title}, ${new Date(task.time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const container = document.getElementById("calendar-scroll-container");

        const popupHeight = 300; // Approx. popup height in px
        const padding = 10;

        const containerRect = container.getBoundingClientRect();
        let calculatedTop = rect.top + window.scrollY;

        // Clamp top to keep popup within container bounds
        if (
          calculatedTop + popupHeight >
          containerRect.bottom + window.scrollY
        ) {
          calculatedTop =
            containerRect.bottom + window.scrollY - popupHeight - padding;
        } else if (calculatedTop < containerRect.top + window.scrollY) {
          calculatedTop = containerRect.top + window.scrollY + padding;
        }

        setPopupPos({
          top: calculatedTop,
          left: rect.left - 360 + window.scrollX, // Position to the left
        });

        setSelectedTask(task);
      }}
    >
      {task.title},{" "}
      {new Date(task.time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </div>
  );
};

export default Task;
