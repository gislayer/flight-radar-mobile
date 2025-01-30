import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./reducers/themeSlice"; // Tema slice'ı
import routeReducer from "./reducers/route";

// Store'u oluştur
const store = configureStore({
  reducer: {
    theme: themeReducer,
    route: routeReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
