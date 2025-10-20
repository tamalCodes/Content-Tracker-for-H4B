const CalendarLegends = () => {
  return (
    <div className="font-outfit pt-10">
      <p className="text-[#ffffff]">My Calendar Contents</p>

      <div className="flex flex-col gap-2 mt-5">
        <div className="flex items-center gap-3">
          <div className="border-[#246942] border-[1px] aspect-square w-4 h-4  text-[#78ca9e] bg-[#044327e2]  rounded-[3px]">
            &nbsp;
          </div>
          <p className="text-[#c6c6c6]">Static Post</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="border-[#1e4658] border-[1px] aspect-square w-4 h-4  text-[#78ca9e] bg-[#042f43e2]  rounded-[3px]">
            &nbsp;
          </div>
          <p className="text-[#c6c6c6]">Video/Reel</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="border-[#663939] border-[1px] aspect-square w-4 h-4 text-[#ff9c9c] bg-[#4a1e1ee2] rounded-[3px]">
            &nbsp;
          </div>
          <p className="text-[#c6c6c6]">Live Event</p>
        </div>
      </div>
    </div>
  );
};

export default CalendarLegends;
