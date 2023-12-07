import { AntDesign } from "@expo/vector-icons";
import Constants from "expo-constants";
import moment from "moment";
import "moment-timezone";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
} from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import Api from "../api/endpoints";
import Button from "../components/Button";
import { BevietBoldText, BevietText } from "../components/Text";
import Colors from "../constants/Colors";
import {
  ACCOUNT_URL,
  ACCOUNT_URL_1, ACCOUNT_URL_2, ACCOUNT_URL_3, ACCOUNT_URL_4,
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY,
  STYLE_COLOR_PRIMARY,
  STYLE_COLOR_SECONDARY
} from "../constants/GlobalConstants";
import useColorScheme from "../hooks/useColorScheme";
import { OrderDetails } from "../navigation/Helpers";
import { RootStackScreenProps } from "../types";
import { DATE2DATE } from "../utils/Helpers";
// import { MaterialIcons } from "@expo/vector-icons";
import SkeletonContent from "../components/SkeletonLoader";

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;
const secondaryColor = STYLE_COLOR_SECONDARY;

export default function CheckOutScreen({
  navigation,
}: RootStackScreenProps<"CheckOut">) {
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const [timeZone, setTimeZone] = useState("America/New_York");
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    let orders1: any[] = await getAllOrders(ACCOUNT_URL_1)
    let orders2: any[] = await getAllOrders(ACCOUNT_URL_2)
    let orders3: any[] = await getAllOrders(ACCOUNT_URL_3)
    let orders4: any[] = await getAllOrders(ACCOUNT_URL_4)

    setOrders([...orders1, ...orders2, ...orders3, ...orders4]);
    setLoading(false);
  };

  const getAllOrders = async (account_name: string) => {
    let params = {
      account_url: account_name,
    }
    let ongoing: any = await Api.getOrderOngoing(params);
    let history: any = await Api.getOrderHistory(params);
    return [...(ongoing.data.data), ...(history.data.data)]
  }

  const getOrderItemTime = (order_Date: any) => {
    let date = new Date(
      order_Date.slice(0, order_Date.indexOf(".") + 4) + "+00:00"
    );
    let dateMomentTimeZone = moment(date).tz(timeZone).format();
    return DATE2DATE((dateMomentTimeZone.slice(0, dateMomentTimeZone.lastIndexOf("-")) + ".000"), false);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View style={styles.backButton}>
        <TouchableOpacity onPress={() => { navigation.navigate("TabMore")}}>
          <AntDesign name="arrowleft" size={30} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <BevietBoldText style={styles.title}>Orders History</BevietBoldText>
      </View>
      

      {loading
      ?
      Array.from([1, 2, 3, 4, 5, 6, 7, 8], x => (
        <View key={x * Math.random()} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15, }}>
            <View>
              <SkeletonContent
                containerStyle={styles.skeleton}
                isLoading={loading}
                layout={[ 
                  { width: 170, height: 10, marginBottom: 6 },
                  { width: 120, height: 10, marginBottom: 6 },
                  { width: 50, height: 10, marginBottom: 6 },
                ]}
              />
            </View>

            <View>
              <SkeletonContent
                  containerStyle={styles.skeleton}
                  isLoading={loading}
                  layout={[ 
                    { width: 140, height: 40, borderRadius: 20 },
                  ]}
              />
            </View>
        </View>
      ))
      :
      orders.length > 0
      ?
      <FlatList
        data={orders}
        keyExtractor={(item) => item.orderId}
        renderItem={({ item, index }: any) => {
          return (
            <View>
              <View style={{ paddingVertical: 15, paddingHorizontal: 18, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <BevietBoldText style={{ fontSize: 16, color: "rgb(24,24,24)" }}>{item.businessName}</BevietBoldText>
                  <BevietText style={{ fontSize: 14, color: "rgb(55,57,60)" }}>{getOrderItemTime(item.order_Date)}</BevietText>
                  <BevietText style={{ fontSize: 14, color: "rgb(55,57,60)" }}>${item.price.toFixed(2)}</BevietText>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate(OrderDetails, {order: item, timeZone: timeZone })} style={{ borderWidth: 2, borderColor: "#144333", borderRadius: 100, justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 8 }}>
                  <BevietBoldText style={{ fontSize: 15, color: "#144333" }}>Order Details</BevietBoldText>
                </TouchableOpacity>
              </View>
              {index != orders.length - 1 && <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.65)', marginLeft: 15 }}></View>}
            </View>
          );
        }}
      />
      :
      orders.length === 0 && !loading
      ?
      // No Orders
      <View style={styles.noDataContainer}>
        <Image source={require("../assets/images/shopping-bag-2.png")} style={styles.noDataImg}/>
        <BevietBoldText style={{ fontSize: 25, color: "#000" }}>No orders yet</BevietBoldText>
      </View>
      : null
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  noDataImg: {
    height: 150,
    width: 150,
    resizeMode: "contain",
    marginBottom: 20,
  },

  noDataContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -150,
  },

  skeleton: {
      width: "100%",
      paddingHorizontal: 0,
      marginTop: 20,
  },

  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  backButton: {
    position: "absolute",
    left: 15,
    top: Constants.statusBarHeight + 8,
    zIndex: 9999,
  },
  header: {
    zIndex: 9998,
  },
  title: {
    fontSize: 30,
    color: '#000',
    left: 15,
    top: Constants.statusBarHeight + 20,
    marginBottom: 60,
  },
});
