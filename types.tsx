
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  Root,
  Modal,
  NotFound,
  Splash,
  Landing,
  TabHome,
  TabOrder,
  TabCart,
  TabLoyalty,
  TabMore,
  Login,
  Otp,
  Register,
  WebView,
  MapView,
  DeliveryAddressDetails,
  Menu,
  CheckOut,
  MyOrders,
  MyDetails,
  OrderDetails,
  OrderTrack,
  EditProfile,
  OrderPlaced,
  PosOrder,
  DineOrders,
  OrderReceipt,
  TabScan,
  Order,
  NoInternet,
  PayOrderSucess,
} from './navigation/Helpers'
import CheckOutScreen from "./screens/CheckOutScreen";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

export type RootStackParamList = {
  [NoInternet]: undefined;
  [Splash]: undefined;
  [Landing]: undefined;
  [Login]: undefined;
  [Register]: any;
  [WebView]: any;
  [Otp]: any;
  [MapView]: any;
  [DeliveryAddressDetails]: any;
  [CheckOut]: undefined;
  [Order]: undefined;
  [MyOrders]: undefined;
  [OrderDetails]: any;
  [OrderTrack]: any;
  [MyDetails]: undefined;
  [EditProfile]: undefined;
  [OrderPlaced]: undefined;
  [PosOrder]: any;
  [PayOrderSucess]: any;
  [DineOrders]: undefined;
  [OrderReceipt]: any;
  [Menu]: any;
  [Root]: NavigatorScreenParams<RootTabParamList> | undefined;
  [Modal]: undefined;
  [NotFound]: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type RootTabParamList = {
  [TabHome]: undefined;
  [TabScan]: undefined;
  [TabCart]: undefined;
  [TabLoyalty]: undefined;
  [TabMore]: undefined;
  [Order]: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >;
