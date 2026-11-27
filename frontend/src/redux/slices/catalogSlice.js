import { createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";
import { apiThunk } from "../apiThunk";

export const fetchProducts = apiThunk("catalog/fetchProducts", async () => {
  const { data } = await api.get("/products");
  return data;
});

const catalogSlice = createSlice({
  name: "catalog",
  initialState: { products: [], status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default catalogSlice.reducer;
