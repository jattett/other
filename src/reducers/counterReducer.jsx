import { createReducer } from '@reduxjs/toolkit';
import { increment, decrement } from '../actions/counterActions';

const initialState = { value: 0 };

const counterReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(increment, (state) => {
      state.value += 1;
    })
    .addCase(decrement, (state) => {
      state.value -= 1;
    });
});

export default counterReducer;
