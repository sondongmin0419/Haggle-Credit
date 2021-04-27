import { all } from "@redux-saga/core/effects";
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { persistReducer } from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";
import createSagaMiddleware from "redux-saga";
import HomeReducer from "../state/home";

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?:typeof compose;
  }
}

const persistConfig = {
  key: "root",
  storage: storageSession,
  whitelist: [],
};

const reducer = combineReducers({
  home: HomeReducer,
});

const sagaMiddleware = createSagaMiddleware();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  persistReducer(persistConfig, reducer),
  composeEnhancers(applyMiddleware(sagaMiddleware))
);

function* rootSaga() {
  yield all([]);
}
sagaMiddleware.run(rootSaga);

export default store;

export type RootState = ReturnType<typeof reducer>;