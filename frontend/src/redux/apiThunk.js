import { createAsyncThunk } from "@reduxjs/toolkit";
import { errorMessage } from "../services/crmApi";

/** createAsyncThunk that rejects with a readable API error message. */
export const apiThunk = (type, fn) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (err) {
      return rejectWithValue(errorMessage(err));
    }
  });
