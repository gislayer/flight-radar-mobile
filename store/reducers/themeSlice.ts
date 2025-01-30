import { createSlice } from "@reduxjs/toolkit";

// Başlangıç state
const initialState = {
  theme: "light",
};

// Slice oluştur
const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
  },
});

// Reducer'ı ve action'ı dışa aktar
export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
