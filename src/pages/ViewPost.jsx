import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineDiscord } from "react-icons/ai";
import { FaXTwitter } from "react-icons/fa6";
import { GrLinkedinOption } from "react-icons/gr";
import { IoLogoInstagram } from "react-icons/io5";
import { MdContentCopy } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DatePickerTrigger from "../components/datepicker/DatePickerTrigger";
import FilePickerTrigger from "../components/filepicker/FilePickerTrigger";
import StatusDropdownTrigger from "../components/statuspicker/StatusDropdownTrigger";
import TimePickerTrigger from "../components/timepicker/TimePickerTrigger";
import { statusOptions } from "../constants/Constants";
import { resetTask } from "../store/slices/taskSlice";

const ViewPost = () => {
  const navigate = useNavigate();
  const task = useSelector((state) => state.task.task);
  const dispatch = useDispatch();
  useEffect(() => {
    if (task?.id === 0) {
      navigate("/");
    }
  }, []);

  const [openAssetsModal, setOpenAssetsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(task.date));
  const [selectedTime, setSelectedTime] = useState(new Date(task.time));
  const [selectedStatus, setSelectedStatus] = useState(
    statusOptions?.find((item) => item?.type === task?.type)
  );
  const [content, setContent] = useState({
    title: task.title,
    description: task.description,
    instagram: task.instagram,
    twitter: task.twitter,
    linkedin: task.linkedin,
    discord: task.discord,
  });
  const [images, setImages] = useState(task.pictures || []);
  const [activeContent, setActiveContent] = useState("instagram");
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerText = content[activeContent] || "";
    }
  }, [activeContent]);

  return (
    <div className="flex flex-col min-h-screen p-10">
      {/* Title and buttons */}
      <div className="flex justify-between items-center">
        <p
          type="text"
          className="font-outfit text-[30px] font-medium text-[#ffffff] border-0 ring-0 focus:ring-0 outline-none  w-[50%] h-[50px]"
        >
          {task.title}
        </p>

        <div className="flex items-center gap-5">
          <button
            className="text-white text-[18px] font-outfit flex items-center gap-[10px] ring ring-[#a8c9fb] w-full rounded-md cursor-pointer justify-center p-2 px-6"
            onClick={() => {
              navigate("/");
              dispatch(resetTask());
            }}
          >
            Go Back
          </button>
        </div>
      </div>

      {/* DatePicker, TimePicker, StatusDropdown */}
      <div className="mt-5 flex items-center gap-3 w-1/2 ">
        <DatePickerTrigger
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          mode={"view"}
        />
        <TimePickerTrigger
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          mode={"view"}
        />
        <StatusDropdownTrigger
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          mode={"view"}
        />
        <FilePickerTrigger
          openAssetsModal={openAssetsModal}
          setOpenAssetsModal={setOpenAssetsModal}
          images={images}
          setImages={setImages}
          mode={"view"}
        />
      </div>

      <textarea
        className="bg-[#0e0e0e] h-[100px] w-1/2 resize-none rounded-md mt-10 outline-none text-[#e7e7e7] p-5 font-outfit text-[18px]"
        placeholder="Write a brief description for this post"
        onChange={(e) =>
          setContent((prev) => ({
            ...prev,
            description: e.target.value,
          }))
        }
        value={content.description || ""}
      />

      {/* Textarea with icons */}
      <div className="mt-10 flex-grow relative h-[1vh] rounded-md">
        <div
          ref={editorRef}
          className="w-1/2 rounded-md h-full overflow-scroll bg-[#0e0e0e] text-[#e7e7e7] font-outfit text-[18px] px-5 pt-[90px]  outline-none resize-none"
          placeholder="Write your post here..."
          onInput={(e) => {
            const value = e.currentTarget.innerText;
            setContent((prev) => ({
              ...prev,
              [activeContent]: value,
            }));
          }}
        />

        {/* Icons for switching platforms */}
        <div className="absolute top-0 left-0 w-[50%] py-5 px-5 h-[70px] rounded-md bg-[#0e0e0e] flex justify-between text-white">
          <div className="flex gap-10">
            <IoLogoInstagram
              className={clsx(
                "text-[25px] mt-[1px] cursor-pointer",
                activeContent === "instagram" ? "opacity-100" : "opacity-50"
              )}
              onClick={() => setActiveContent("instagram")}
            />
            <FaXTwitter
              className={clsx(
                "text-[25px] cursor-pointer",
                activeContent === "twitter" ? "opacity-100" : "opacity-50"
              )}
              onClick={() => setActiveContent("twitter")}
            />
            <GrLinkedinOption
              className={clsx(
                "text-[25px] cursor-pointer",
                activeContent === "linkedin" ? "opacity-100" : "opacity-50"
              )}
              onClick={() => setActiveContent("linkedin")}
            />
            <AiOutlineDiscord
              className={clsx(
                "text-[30px] cursor-pointer",
                activeContent === "discord" ? "opacity-100" : "opacity-50"
              )}
              onClick={() => setActiveContent("discord")}
            />
          </div>

          <MdContentCopy
            className={clsx("text-[25px] mt-[1px] cursor-pointer")}
            onClick={() => {
              navigator.clipboard.writeText(content[activeContent] || "");
              toast.success("Copied to clipboard");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewPost;
