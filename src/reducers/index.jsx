import { combineReducers } from 'redux';
import counterReducer from './counterReducer';
import mapReducer from './mapReducer';

const rootReducer = combineReducers({
  counter: counterReducer,
  map: mapReducer,
});

export default rootReducer;
