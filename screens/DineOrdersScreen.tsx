import { AntDesign } from "@expo/vector-icons";
import { create } from "apisauce";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import Api from "../api/endpoints";
import Colors from "../constants/Colors";
import {
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY,
  STYLE_COLOR_PRIMARY,
} from "../constants/GlobalConstants";
import useColorScheme from "../hooks/useColorScheme";
import { OrderReceipt } from "../navigation/Helpers";
import { RootStackScreenProps } from "../types";
import { DATE2DATE } from "../utils/Helpers";
import SkeletonContent from "../components/SkeletonLoader";
import { BevietBoldText } from "../components/Text";

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;

const POS_URL = "https://api.kattooz.com/";
// TEST
// const POS_URL = "https://staging.api-pos.kattooz.com/";

const posClient = create({
  baseURL: POS_URL,
});

export default function DineOrdersScreen({
  navigation,
  route,
}: RootStackScreenProps<"DineOrders">) {
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrders();
  }, []);

  const getOrders = async () => {
    setLoading(true);
    let userResponse: any = (await Api.getUserInfo()).data;
    posClient
      .get(`pos/orders/by-app-user-id/${userResponse.data.userId}`)
      .then((response: any) => {
        if (response.data.type == "success") {
          setOrders(response.data.data);
        }
      });
    setLoading(false);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      {/* <View style={styles.backButton}>
        <TouchableOpacity  onPress={() => { navigation.goBack(); }}>
          <AntDesign name="arrowleft" size={30} color="#000" />
        </TouchableOpacity>

        <Text style={{ fontSize: 30, fontFamily: "beviet-bold", marginBottom: loading ? 50 : 0 }}>
          Dine-In Orders
        </Text>
      </View> */}
      <View style={styles.backButton}>
        <TouchableOpacity onPress={() => { navigation.navigate("TabMore") }}>
          <AntDesign name="arrowleft" size={30} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <BevietBoldText style={styles.title}>Dine-In Orders</BevietBoldText>
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
          keyExtractor={(item, index) => (index * Math.random()).toString()}
          data={orders}
          style={{ flex: 1, marginTop: 50 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          ListFooterComponent={<View style={{ flex: 1, width: 8 }} />}
          renderItem={({ item, index }) => (
            <View style={{}}>
              <View
                style={{
                  paddingHorizontal: 15,
                  marginVertical: 15,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 17, fontFamily: "beviet-bold" }}>
                    {item.restaurantName}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "beviet-regular",
                      color: "#37393C",
                    }}
                  >
                    {DATE2DATE(item.placed, false)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "beviet-regular",
                      color: "#37393C",
                    }}
                  >
                    ${item.total / 100}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(OrderReceipt, {
                      order: item,
                      server: item.server,
                    })
                  }
                  style={{
                    borderWidth: 2,
                    borderColor: "rgb(20,67,51)",
                    borderRadius: 30,
                    paddingVertical: 10,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "beviet-bold",
                      color: "rgb(20,67,51)",
                      textAlign: "center",
                    }}
                  >
                    View Receipt
                  </Text>
                </TouchableOpacity>
              </View>
              {index < orders.length - 1 && (
                <View
                  style={{
                    backgroundColor: "rgba(0,0,0,0.3)",
                    height: 2,
                    marginLeft: 20,
                  }}
                ></View>
              )}
            </View>
          )}
      />
      :
      orders.length === 0 && !loading
      ?
      // No Orders
      <View style={styles.noDataContainer}>
        <Image source={require("../assets/images/shopping-bag-2.png")} style={styles.noDataImg}/>
        <Text style={{ fontSize: 30, fontFamily: "beviet-bold" }}>No orders yet</Text>
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
  },

  title: {
    fontSize: 30,
    color: '#000',
    left: 15,
    top: Constants.statusBarHeight + 20,
    marginBottom: 60,
  },

  backButton: {
    position: "absolute",
    left: 15,
    top: Constants.statusBarHeight + 8,
    zIndex: 9999,
  },
});
