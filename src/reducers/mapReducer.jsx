import { createReducer } from '@reduxjs/toolkit';
import {
  setKeyword,
  setMap,
  setPlaces,
  setMarkers,
  setPagination,
  setRoadview,
  setCurrentPosition,
  setCurrentMarker,
  setAiInput,
  setGymnasiums,
  setLoading,
} from '../actions/actions';

const initialState = {
  keyword: '',
  map: null,
  places: [],
  markers: [],
  pagination: null,
  roadview: null,
  currentPosition: null,
  currentMarker: null,
  aiInput: '',
  gyms: [],
  loading: false,
};

const mapReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setKeyword, (state, action) => {
      state.keyword = action.payload;
    })
    .addCase(setMap, (state, action) => {
      state.map = action.payload;
    })
    .addCase(setPlaces, (state, action) => {
      state.places = action.payload;
    })
    .addCase(setMarkers, (state, action) => {
      state.markers = action.payload;
    })
    .addCase(setPagination, (state, action) => {
      state.pagination = action.payload;
    })
    .addCase(setRoadview, (state, action) => {
      state.roadview = action.payload;
    })
    .addCase(setCurrentPosition, (state, action) => {
      state.currentPosition = action.payload;
    })
    .addCase(setCurrentMarker, (state, action) => {
      state.currentMarker = action.payload;
    })
    .addCase(setAiInput, (state, action) => {
      state.aiInput = action.payload;
    })
    .addCase(setGymnasiums, (state, action) => {
      state.gyms = action.payload;
    })
    .addCase(setLoading, (state, action) => {
      state.loading = action.payload;
    });
});

export default mapReducer;
