/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
// ICONS
import React, { useState, useEffect, useRef } from "react";
import { ColorSchemeName, Text, View } from "react-native";
import {
  Feather,
  FontAwesome, MaterialCommunityIcons
} from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY, STYLE_COLOR_PRIMARY
} from "../constants/GlobalConstants";
// import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";
import CheckOutScreen from "../screens/CheckOutScreen";
import DeliveryAddressDetailsScreen from "../screens/DeliveryAddressDetailsScreen";
import DineOrdersScreen from "../screens/DineOrdersScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import LandingScreen from "../screens/LandingScreen";
import LoginScreen from "../screens/LoginScreen";
import MapViewScreen from "../screens/MapViewScreen";
import MenuScreen from "../screens/MenuScreen";
import ModalScreen from "../screens/ModalScreen";
import MyDetailsScreen from "../screens/MyDetailsScreen";
import OrderScreen from "../screens/OrderScreen";
import MyOrdersScreen from "../screens/MyOrdersScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import OrderDetailsScreen from "../screens/OrderDetailsScreen";
import OrderPlacedScreen from "../screens/OrderPlacedScreen";
import OrderReceiptScreen from "../screens/OrderReceiptScreen";
import OrderTrackScreen from "../screens/OrderTrackScreen";
import OtpScreen from "../screens/OtpScreen";
import PosOrderScreen from "../screens/PosOrderScreen";
import RegisterScreen from "../screens/RegisterScreen";
import SplashScreen from "../screens/SplashScreen";
import TabCartScreen from "../screens/TabCartScreen";
import TabHomeScreen from "../screens/TabHomeScreen";
import TabLoyaltyScreen from "../screens/TabLoyaltyScreen";
import TabMoreScreen from "../screens/TabMoreScreen";
import TabScanScreen from "../screens/TabScanScreen";
import WebViewScreen from "../screens/WebViewScreen";
import NoInternetScreen from "../screens/NoInternetScreen";
import PayOrderSucessScreen from "../screens/PayOrderSucessScreen";

import { RootStackParamList, RootTabParamList } from "../types";
import { useGlobalState } from "../utils/Global";
import {
  CheckOut, DeliveryAddressDetails, DineOrders, EditProfile, Landing,
  Login, MapView, Menu, Modal, MyDetails, MyOrders, NotFound, Order, OrderDetails, OrderPlaced, OrderReceipt, OrderTrack, Otp, PosOrder, Register, Root, Splash, TabCart, TabHome, TabLoyalty,
  TabMore, TabScan, WebView, NoInternet, PayOrderSucess,
} from "./Helpers";
import LinkingConfiguration from "./LinkingConfiguration";
import NetInfo from '@react-native-community/netinfo';

// const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
// const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;

export default function Navigation({ colorScheme } : { colorScheme: ColorSchemeName; }) {

  return (

      <RootNavigator />

  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {

  const [internet, setInternet] = useState<any>(false);
  
  const prevStateRef = useRef<boolean>();

  const unsubscribe = NetInfo.addEventListener(state => {
    // console.log("Yow", state.isConnected);
    if(prevStateRef.current !== state.isConnected) {
      prevStateRef.current = internet;
      setInternet(state.isConnected);
    }
  });

  useEffect(() => {
      unsubscribe();
  }, []);

  return (
    <Stack.Navigator>
      {/* {!internet
      ?
      <Stack.Screen
        name={NoInternet}
        component={NoInternetScreen}
        options={{ headerShown: false }}
      />
      :
      <> */}
      <Stack.Screen
        name={Splash}
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Landing}
        component={LandingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Login}
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Register}
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Otp}
        component={OtpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={MapView}
        component={MapViewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={DeliveryAddressDetails}
        component={DeliveryAddressDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Menu}
        component={MenuScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={WebView}
        component={WebViewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={CheckOut}
        component={CheckOutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Root}
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NotFound}
        component={NotFoundScreen}
        options={{ title: "Oops!" }}
      />
      <Stack.Screen
        name={Order}
        component={OrderScreen}
        options={{ headerShown: false }}
      />
        <Stack.Screen
        name={MyOrders}
        component={MyOrdersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={OrderDetails}
        component={OrderDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={OrderTrack}
        component={OrderTrackScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={MyDetails}
        component={MyDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={EditProfile}
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={OrderPlaced}
        component={OrderPlacedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={PosOrder}
        component={PosOrderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={PayOrderSucess}
        component={PayOrderSucessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={DineOrders}
        component={DineOrdersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={OrderReceipt}
        component={OrderReceiptScreen}
        options={{ headerShown: false }}
      />
      <Stack.Group screenOptions={{ presentation: "modal" }}>
        <Stack.Screen name={Modal} component={ModalScreen} />
      </Stack.Group>
      {/* </>
      } */}
    </Stack.Navigator>
  );
}
/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();
  const [carts, setCarts] = useGlobalState<any>("cart");

  return (
    <BottomTab.Navigator
      initialRouteName={TabHome}
      // screenOptions={{
      //   tabBarActiveTintColor: primaryColor, //Colors[colorScheme].tint,
      //   tabBarLabelStyle: {
      //     fontFamily: "beviet-regular"
      //   }
      // }}
      screenOptions={({ route }) => ({
        tabBarButton: [
          "Order",
        ].includes(route.name)
          ? () => {
              return null;
            }
          : undefined,
      })}
    >
      <BottomTab.Screen
        name={Order}
        component={OrderScreen}
        options={{
          headerShown: false,
        }}
      />
      <BottomTab.Screen
        name={TabHome}
        component={TabHomeScreen}
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="glasses" size={30} color={color} />
          ),
        }}
      />

      <BottomTab.Screen
        name={TabScan}
        component={TabScanScreen}
        options={{
          title: "Scan & Pay",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* BASKET */}
      <BottomTab.Screen
        name={TabCart}
        component={TabCartScreen}
        options={{
          headerShown: false,
          title: "Carts",
          tabBarIcon: ({ color }) => (
            <View
              style={{
                backgroundColor: primaryColor, // Colors[colorScheme].tint,
                height: 80,
                width: 80,
                borderRadius: 40,
                borderColor: "#ffffff",
                borderWidth: 10,
                alignItems: "center",
                justifyContent: "center",
                bottom: 10,
              }}
            >
              {carts.data.length > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -5,
                    right: 0,
                    backgroundColor: "#333333",
                    borderRadius: 12,
                    height: 24,
                    width: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFF",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  >
                    {carts.data.length}
                  </Text>
                </View>
              )}
              {/* <FontAwesome name="shopping-basket" size={24} color="#FFF" /> */}
              {/* <MaterialCommunityIcons name="cart-plus" size={30} color="#FFF" /> */}
              <FontAwesome name="opencart" size={28} color="#FFF" />
            </View>
          ),
          tabBarLabel: "",
          tabBarLabelStyle: { height: 0 },
        }}
      />

      <BottomTab.Screen
        name={TabLoyalty}
        component={TabLoyaltyScreen}
        options={{
          headerShown: false,
          title: "Loyalty",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="cash-100"
              size={26}
              color={color}
            />
          ),
        }}
      />

      <BottomTab.Screen
        name={TabMore}
        component={TabMoreScreen}
        options={{
          headerShown: false,
          title: "More",
          tabBarIcon: ({ color }) => (
            <Feather name="more-horizontal" size={28} color={color} />
            // <MaterialCommunityIcons name="more" size={26} color={color} />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={30} style={{ marginBottom: -3 }} {...props} />;
}
