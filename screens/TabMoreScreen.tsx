
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import ChatButton from "../components/ChatButton";
import SafeAreaView from "react-native-safe-area-view";
import SVGCall from "../assets/images/call.svg";
import SVGDine from "../assets/images/ic_dine.svg";
import SVGInformation from "../assets/images/ic_information.svg";
import SVGMyOrders from "../assets/images/ic_myorders.svg";
import SVGProfleIcon from "../assets/images/ic_profile.svg";
import SVGLogout from "../assets/images/logout.svg";
import SVGPrivacy from "../assets/images/privacy.svg";
import SVGTerm from "../assets/images/term.svg";
import Colors from "../constants/Colors";
import {
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY, STYLE_COLOR_PRIMARY
} from "../constants/GlobalConstants";
import useColorScheme from "../hooks/useColorScheme";
import { DineOrders, MyDetails, MyOrders, Splash, WebView } from "../navigation/Helpers";
import { RootTabScreenProps } from "../types";
import {
  setGlobalState
} from "../utils/Global";
import { STORAGE_USER, storeData } from "../utils/Helpers";


const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;

export default function TabMoreScreen({ navigation }: RootTabScreenProps<"TabMore">) {

  const colorScheme = useColorScheme();
  const [loyalPoint, setLoyalPoint] = useState(0);
  const [name, setName] = useState("");

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
      </View>
      <ScrollView>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(MyOrders);
          }}
          style={styles.row}
        >
          <SVGMyOrders width={30} height={30} fill="rgba(0,0,0,0.74)" />
          <Text style={styles.text}>My orders</Text>
        </TouchableOpacity>
        <View style={styles.divide}></View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(DineOrders);
          }}
          style={styles.row}
        >
          <SVGDine width={30} height={30} fill="rgba(0,0,0,0.74)" />
          <Text style={styles.text}>Dine-In Orders</Text>
        </TouchableOpacity>
        <View style={styles.divide}></View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(MyDetails);
          }}
          style={styles.row}
        >
          <SVGProfleIcon width={30} height={30} fill="rgba(0,0,0,0.74)" />
          <Text style={styles.text}>My details</Text>
        </TouchableOpacity>
        <View style={styles.divide}></View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(WebView, {
              url: "https://tradersexpressdeli.com/contact/",
            });
          }}
          style={styles.row}
        >
          <SVGCall width={30} height={30} fill="rgba(0,0,0,0.74)" />
          <Text style={styles.text}>Contact Us</Text>
        </TouchableOpacity>
        <View style={styles.divide}></View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(WebView, {
              url: "https://tradersexpressdeli.com/privacy-policy/",
            });
          }}
          style={styles.row}
        >
          <SVGPrivacy width={30} height={30} fill="rgba(0,0,0,0.74)" />
          <Text style={styles.text}>Privacy Policy</Text>
        </TouchableOpacity>
        <View style={styles.divide}></View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(WebView, {
              url: "https://tradersexpressdeli.com/terms-of-use-agreement/",
            });
          }}
          style={styles.row}
        >
          <SVGTerm width={30} height={30} fill="rgba(0,0,0,0.74)" />
          <Text style={styles.text}>Terms & Conditions</Text>
        </TouchableOpacity>
        <View style={styles.divide}></View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(WebView, {
              url: "https://tradersexpressdeli.com/california-notice-of-right-to-opt-out/",
            });
          }}
          style={styles.row}
        >
          <SVGInformation width={30} height={30} fill="rgba(0,0,0,0.74)" />
          <Text style={styles.text}>Do not sell my information</Text>
        
        </TouchableOpacity>
        <View style={styles.divide}></View>
        <TouchableOpacity
          onPress={async () => {
            await storeData(STORAGE_USER, "");
            setGlobalState("token", "");
            navigation.navigate(Splash);
          }}
          style={styles.row}
        >
          <SVGLogout width={30} height={30} fill="rgba(0,0,0,0.74)" />
          <Text style={styles.text}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <ChatButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  title: {
    color: "#181818",
    fontWeight: "bold",
    fontSize: 30,
    fontFamily: "beviet-bold"
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 30
  },
  text: {
    color: 'rgba(0,0,0,0.74)',
    fontWeight: "500",
    fontSize: 18,
    marginLeft: 20,
  },

  divide: {
    height: 1,
    backgroundColor: 'black',
    marginLeft:20,
    opacity:0.2
  }
});
