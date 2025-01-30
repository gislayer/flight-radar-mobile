import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FlightData } from "@/lib/types";

const initialState: {
  route: FlightData | null;
} = {
  route: null
};

const routeSlice = createSlice({
  name: "route",
  initialState,
  reducers: {
    setNewRoute: (state, action: PayloadAction<FlightData>) => {
      state.route = action.payload;
    },
    clearRoute: (state) => {
      state.route = null;
    }
  }
});

export const { setNewRoute, clearRoute } = routeSlice.actions;
export default routeSlice.reducer;
