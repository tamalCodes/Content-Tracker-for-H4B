import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineDiscord } from "react-icons/ai";
import { FaXTwitter } from "react-icons/fa6";
import { GrLinkedinOption } from "react-icons/gr";
import { IoLogoInstagram } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createContent, updateContent } from "../api/queries";
import DatePickerTrigger from "../components/datepicker/DatePickerTrigger";
import FilePickerTrigger from "../components/filepicker/FilePickerTrigger";
import StatusDropdownTrigger from "../components/statuspicker/StatusDropdownTrigger";
import TimePickerTrigger from "../components/timepicker/TimePickerTrigger";
import { statusOptions } from "../constants/Constants";
import { selectSelectedDate } from "../store/slices/globalSlice";
import { resetTask } from "../store/slices/taskSlice";

const CreatePost = ({ mode }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const task = useSelector((state) => state.task.task);
  const globallySelectedDate = useSelector(selectSelectedDate);
  const selectedDate =
    mode === "edit" ? new Date(task.date) : globallySelectedDate;

  useEffect(() => {
    if (task?.id === 0 && mode === "edit") {
      navigate("/");
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [openAssetsModal, setOpenAssetsModal] = useState(false);

  const initialTime =
    task?.time && !isNaN(new Date(task.time))
      ? new Date(task.time)
      : new Date();

  const [selectedTime, setSelectedTime] = useState(initialTime);

  const [selectedStatus, setSelectedStatus] = useState(
    statusOptions.find((option) => option.type === task?.type) ||
      statusOptions?.find((option) => option.type === "static")
  );

  const [content, setContent] = useState({
    title: task?.title || ``,
    description: task?.description || ``,
    instagram: task?.instagram || ``,
    twitter: task?.twitter || ``,
    linkedin: task?.linkedin || ``,
    discord: task?.discord || ``,
  });

  const [images, setImages] = useState(task?.pictures || []);
  const [activeContent, setActiveContent] = useState("instagram");
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.textContent = content[activeContent] || "";
    }
  }, [activeContent]);

  const handleSave = async () => {
    setLoading(true);

    if (content.title === "" || content.description === "") {
      toast.error("Title and Description are required.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();

      formData.append("instagram", content.instagram);
      formData.append("discord", content.discord);
      formData.append("twitter", content.twitter);
      formData.append("linkedin", content.linkedin);
      formData.append("date", selectedDate);
      formData.append("time", selectedTime);
      formData.append("type", selectedStatus?.type);
      formData.append("title", content.title);
      formData.append("description", content.description);

      images.forEach((image) => {
        formData.append("pictures", image);
      });

      const debugFormData = {};
      formData.forEach((value, key) => {
        if (debugFormData[key]) {
          // Handle multiple values (e.g., files with same key)
          if (!Array.isArray(debugFormData[key])) {
            debugFormData[key] = [debugFormData[key]];
          }
          debugFormData[key].push(value);
        } else {
          debugFormData[key] = value;
        }
      });

      if (mode === "edit") {
        // Extract existing images (ones with an ID)
        const existingPictures = images
          .filter((img) => img.id) // Already in DB
          .map(({ id, url, filename }) => ({ id, url, filename }));

        // Send existing images as JSON string
        formData.append("existingPictures", JSON.stringify(existingPictures));

        // Upload only new images (File objects)
        images
          .filter((img) => !img.id) // New images
          .forEach((file) => formData.append("pictures", file));

        await updateContent(formData, task?._id);
        toast.success("Post updated successfully!");
      } else {
        await createContent(formData);
        toast.success("Post created successfully!");
      }

      dispatch(resetTask());
      navigate("/");
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Failed to save post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-10">
      {/* Title and buttons */}
      <div className="flex justify-between items-center">
        <input
          type="text"
          className="font-outfit text-[25px] font-medium border-b-2 text-[#e1e1e1] border-0 ring-0 focus:ring-0 outline-none placeholder:text-[#c6c6c699] w-[60%] h-[50px] border-b-[#a8c9fb]"
          placeholder="Add a title"
          autoFocus={true}
          onChange={(e) =>
            setContent((prev) => ({
              ...prev,
              title: e.target.value,
            }))
          }
          value={content.title || ""}
        />

        <div className="flex items-center gap-5">
          <button
            className="text-black text-[18px] whitespace-nowrap font-outfit flex items-center gap-[10px] bg-[#a8c9fb] w-full rounded-md cursor-pointer justify-center p-2 px-6 disabled:cursor-not-allowed disabled:bg-[#a8c9fb99] disabled:text-[#e1e1e1] ]"
            disabled={!content.title || !content.description || loading}
            onClick={() => {
              handleSave();
            }}
          >
            {mode === "edit" ? "Update" : "Schedule"} Post
          </button>

          <button
            className="text-white text-[18px] font-outfit flex items-center gap-[10px] ring ring-[#a8c9fb] w-full rounded-md cursor-pointer justify-center p-2 px-6"
            onClick={() => {
              navigate("/");
              dispatch(resetTask());
            }}
          >
            {mode === "edit" ? "Cancel" : "Discard"}
          </button>
        </div>
      </div>

      {/* DatePicker, TimePicker, StatusDropdown */}
      <div className="mt-5 flex flex-wrap items-center gap-3 w-[60%] ">
        <DatePickerTrigger mode={mode} />
        <TimePickerTrigger
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
        />
        <StatusDropdownTrigger
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />
        <FilePickerTrigger
          openAssetsModal={openAssetsModal}
          setOpenAssetsModal={setOpenAssetsModal}
          images={images}
          setImages={setImages}
        />
      </div>

      <textarea
        className="bg-[#0e0e0e] h-[100px] w-[60%] resize-none rounded-md mt-10 outline-none text-[#e7e7e7] p-5 font-outfit text-[18px]"
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
      <div className="mt-10 relative w-[60%] h-full  grow flex flex-col">
        {/* Platform selector bar */}
        <div className=" w-full py-5 px-5 h-[70px] rounded-tl-md rounded-tr-md bg-[#0e0e0e] flex justify-between text-white z-10">
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
        </div>

        {/* Textarea */}
        <textarea
          className="bg-[#0e0e0e] grow h-full w-full rounded-bl-md rounded-br-md outline-none text-[#e7e7e7] p-5 font-outfit text-[18px] resize-none"
          placeholder="Write your post here..."
          value={content[activeContent] || ""}
          onChange={(e) =>
            setContent((prev) => ({
              ...prev,
              [activeContent]: e.target.value,
            }))
          }
        />
      </div>
    </div>
  );
};

export default CreatePost;
