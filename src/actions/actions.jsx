import { createSlice } from '@reduxjs/toolkit';

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

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setKeyword: (state, action) => {
      state.keyword = action.payload;
    },
    setMap: (state, action) => {
      state.map = action.payload;
    },
    setPlaces: (state, action) => {
      state.places = action.payload;
    },
    setMarkers: (state, action) => {
      state.markers = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    setRoadview: (state, action) => {
      state.roadview = action.payload;
    },
    setCurrentPosition: (state, action) => {
      state.currentPosition = action.payload;
    },
    setCurrentMarker: (state, action) => {
      state.currentMarker = action.payload;
    },
    setAiInput: (state, action) => {
      state.aiInput = action.payload;
    },
    setGymnasiums: (state, action) => {
      state.gyms = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
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
} = mapSlice.actions;

export default mapSlice.reducer;
