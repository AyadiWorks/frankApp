import { createGlobalState } from "react-hooks-global-state";
import { STYLE_COLOR_PRIMARY } from "../constants/GlobalConstants";
const initialState = {
  menu: null,
  address: null,
  address1: null,
  address2: null,
  address3: null,
  address4: null,
  cart: { data: [], account_url:"", branche_url:"", restaurant_name:""},
  primaryColor: STYLE_COLOR_PRIMARY,
  textColor: "#000",
  token: "",
  deliveryAddress: null,
  deliveryAddressList: [],
  deliveryFee: 0,
  taxPercent: 0,
  taxIncluded: false,
  outletId: "",
  delivery: true,
  account_url:"",
  branche_url:"",
  refreshOrder:false
};

export const { useGlobalState, getGlobalState, setGlobalState } =
  createGlobalState(initialState);
