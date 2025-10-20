import CalendarLarge from "@components/home/CalendarLarge";
import LeftSidebar from "@components/home/LeftSidebar";
import useContents from "@hooks/useContents";
import { selectReRenderSwitch } from "@store/slices/globalSlice";
import { useSelector } from "react-redux";

const Home = () => {
  const reRenderSwitch = useSelector(selectReRenderSwitch);
  const contents = useContents(reRenderSwitch);

  return (
    <div className="overflow-y-hidden h-screen">
      <div className="flex items-start gap-[2rem] md:p-5 p-3">
        <LeftSidebar />
        <div className="w-full md:p-5 pr-3 rounded-[20px] bg-[#131313]">
          <CalendarLarge tasks={contents} />
        </div>
      </div>
    </div>
  );
};

export default Home;
