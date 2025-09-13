import { globalSlice } from "./slices/globalSlice";
import { taskSlice } from "./slices/taskSlice";

const rootReducer = {
  task: taskSlice.reducer,
  global: globalSlice.reducer,
};

export default rootReducer;
