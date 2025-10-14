import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selected: [] // array of seatId strings
};

const seatsSlice = createSlice({
  name: 'seats',
  initialState,
  reducers: {
    toggleSeat(state, action) {
      const seatId = action.payload;
      const i = state.selected.indexOf(seatId);
      if (i >= 0) state.selected.splice(i, 1);
      else state.selected.push(seatId);
    },
    clearSelection(state) {
      state.selected = [];
    },
    setSelection(state, action) {
      state.selected = action.payload || [];
    }
  }
});

export const { toggleSeat, clearSelection, setSelection } = seatsSlice.actions;
export default seatsSlice.reducer;
