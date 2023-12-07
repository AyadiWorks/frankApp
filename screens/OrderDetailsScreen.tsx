import { AntDesign } from "@expo/vector-icons";
import Constants from "expo-constants";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import StepIndicator from "react-native-step-indicator";
import Api from "../api/endpoints";
import { BevietBoldText, BevietText } from "../components/Text";
import Colors from "../constants/Colors";
import {
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY,
  STYLE_COLOR_PRIMARY,
} from "../constants/GlobalConstants";
import useColorScheme from "../hooks/useColorScheme";
import { RootStackScreenProps } from "../types";
import { getGlobalState } from "../utils/Global";
import { DATE2DATE } from "../utils/Helpers";
import SkeletonContent from "../components/SkeletonLoader";

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;
const customStyles = {
  stepIndicatorSize: 25,
  currentStepIndicatorSize: 30,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: "#144333",
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: "#144333",
  stepStrokeUnFinishedColor: "#aaaaaa",
  separatorFinishedColor: "#144333",
  separatorUnFinishedColor: "#aaaaaa",
  stepIndicatorFinishedColor: "#144333",
  stepIndicatorUnFinishedColor: "#ffffff",
  stepIndicatorCurrentColor: "#ffffff",
};

export default function OrderDetailsScreen({
  navigation,
  route,
}: RootStackScreenProps<"OrderDetails">) {
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const [history, setHistory] = useState([]);
  const initOrder = route.params?.order;
  const outletTimezone = route.params?.timeZone;
  const [order, setOrder] = useState<any>(initOrder);
  const [orderInfo, setOrderInfo] = useState<any>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [phoneNumber, setPhoneNumber] = useState<any>("sample");

  let orderId =  initOrder.orderId;

  
  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (orderInfo?.status === "ready") {
      setCurrentPage(2);
    } else if (orderInfo?.status === "completed") {
      setCurrentPage(3);
    } else {
      setCurrentPage(1);
    }
  }, [orderInfo]);

  const init = async () => {
    let params = {
      orderID: order.orderId,
    };
    let res: any = await Api.getOrderById(params);
    setPhoneNumber(res.data.data.phoneNumber);

    let temp: any = await Api.checkOrderById(params);
    try {
      if (temp.data.status) {
        setOrder({ ...order, ...temp.data.data });
      }
    } catch (error) {}
    let params1 = {
      orderId: order.orderId,
    };
    let temp1: any = await Api.getOrderById(params1);
    try {
      if (temp1.data.status) {
        setOrderInfo(temp1.data.data);
        setLoading(false);
      }
    } catch (error) {}
  };

  const iconsDeliveryAccepted = [
    require("../assets/images/confirm_white.png"),
    require("../assets/images/cutting-board-green.png"),
    require("../assets/images/delivery-green.png"),
  ];
  const iconsDeliveryReady = [
    require("../assets/images/confirm_white.png"),
    require("../assets/images/cutting-board-white.png"),
    require("../assets/images/delivery-green.png"),
  ];
  const iconsDeliveryCompleted = [
    require("../assets/images/confirm_white.png"),
    require("../assets/images/cutting-board-white.png"),
    require("../assets/images/delivery-white.png"),
  ];
  const iconsPickUpAccepted = [
    require("../assets/images/confirm_white.png"),
    require("../assets/images/cutting-board-green.png"),
    require("../assets/images/delivery-man-green.png"),
  ];
  const iconsPickUpReady = [
    require("../assets/images/confirm_white.png"),
    require("../assets/images/cutting-board-white.png"),
    require("../assets/images/delivery-man-green.png"),
  ];
  const iconsPickUpCompleted = [
    require("../assets/images/confirm_white.png"),
    require("../assets/images/cutting-board-white.png"),
    require("../assets/images/delivery-man-white.png"),
  ];
  const getOrderItemTime = (order_Date: any) => {
    let date = new Date(
      order_Date.slice(0, order_Date.indexOf(".") + 4) + "+00:00"
    );
    let dateMomentTimeZone = moment(date).tz(outletTimezone).format();
    return DATE2DATE(
      dateMomentTimeZone.slice(0, dateMomentTimeZone.lastIndexOf("-")) + ".000",
      true
    );
  };

  const getOrderPhoneNum = (order_num: any) => {
    return order_num
  }
  return (
    <SafeAreaView style={[ styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      
      <View style={styles.backButton}>
        <TouchableOpacity onPress={() => navigation.goBack() }>
          <AntDesign name="arrowleft" size={30} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <BevietBoldText style={styles.title}>Order Details</BevietBoldText>
      </View>

      {loading
      ?
      <View style={{ flex: 1, paddingHorizontal: 15, }}>
        <SkeletonContent
          containerStyle={styles.skeleton}
          isLoading={loading}
          layout={[ 
            { width: 250, height: 12, marginBottom: 10 },
            { width: "100%", height: 15, marginBottom: 20 },
          ]}
        />

        <SkeletonContent
          containerStyle={styles.skeleton}
          isLoading={loading}
          layout={[ 
            { width: 170, height: 10, marginBottom: 10 },
            { width: "80%", height: 10, marginBottom: 6 },
            { width: "50%", height: 10, marginBottom: 6 },
            { width: "50%", height: 10, marginBottom: 6 },
          ]}
        />

        <View style={[styles.divider, {left: -15, marginVertical: 30 }]}/>

        {Array.from([1,2], i => (
          <View key={(i * Math.random()).toString()}>
          <SkeletonContent
            containerStyle={styles.skeleton}
            isLoading={loading}
            layout={[ 
              { width: "100%", height: 10, marginBottom: 10 },
            ]}
          />
          <View style={[styles.dividerOrder, { marginVertical: 20 }]}/>
          </View>
        ))}

        {Array.from([1,2,3,4], i => (
          <View key={(i * Math.random()).toString()} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
            <View>
              <SkeletonContent
                  containerStyle={styles.skeleton}
                  isLoading={loading}
                  layout={[ 
                    { width: 70, height: 10 },
                  ]}
              />
            </View>

            <View>
              <SkeletonContent
                  containerStyle={styles.skeleton}
                  isLoading={loading}
                  layout={[ 
                    { width: 70, height: 10,},
                  ]}
              />
            </View>
          </View>
        ))}

        
        
      </View>
      :
      <ScrollView contentContainerStyle={{ paddingTop: 0 }}>
        
        <View>

          <View style={{ paddingHorizontal: 15 }}>
            <BevietText style={styles.state}>
              {currentPage === 1
                ? "Your order is being prepared"
                : orderInfo?.ordering_service == "delivery" &&
                  currentPage === 2
                ? "Your order is out for delivery"
                : orderInfo?.ordering_service !== "delivery" &&
                  currentPage === 2
                ? "Your order is ready for pickup"
                : "Your order is complete"}
            </BevietText>
          </View>

          <View style={{ marginTop: 15 }}>
            <StepIndicator
              customStyles={customStyles}
              stepCount={3}
              currentPosition={currentPage}
              renderStepIndicator={({ position, stepstatus }) => (
                <Image
                  source={
                    orderInfo?.ordering_service === "delivery" &&
                    orderInfo?.status === "accepted"
                      ? iconsDeliveryAccepted[position]
                      : orderInfo?.ordering_service === "delivery" &&
                        orderInfo?.status === "ready"
                      ? iconsDeliveryReady[position]
                      : orderInfo?.ordering_service === "delivery" &&
                        orderInfo?.status === "completed"
                      ? iconsDeliveryCompleted[position]
                      : orderInfo?.ordering_service == "pickup" &&
                        orderInfo?.status === "accepted"
                      ? iconsPickUpAccepted[position]
                      : orderInfo?.ordering_service == "pickup" &&
                        orderInfo?.status === "ready"
                      ? iconsPickUpReady[position]
                      : iconsPickUpCompleted[position]
                  }
                  style={{ width: 15, height: 15 }}
                  resizeMode="contain"
                />
              )}
            />
          </View>

          <View style={{ paddingHorizontal: 15 }}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <BevietBoldText
                style={{
                  fontSize: 24,
                  color: "#144333",
                  fontWeight: "bold",
                  marginTop: 20,
                }}
              >
                {orderInfo?.ordering_service == "delivery"
                  ? "Delivered to"
                  : "Pickup from"}
              </BevietBoldText>
            </View>
            {order?.order_service == "pick-up" && (
              <BevietText
                style={{
                  fontSize: 16,
                  color: "#37393c",
                  marginTop: 5,
                }}
              >
                {order?.businessName}
              </BevietText>
            )}
            <BevietText
              style={{
                fontSize: 16,
                color: "#37393c",
                marginTop: 5,
              }}
            >
              {order?.address_order}
            </BevietText>
            <BevietText
              style={{
                fontSize: 16,
                color: "#37393c",
                marginTop: 5,
              }}
            >
              {getOrderItemTime(order?.order_Date)}
            </BevietText>
            <BevietText
              style={{
                fontSize: 16,
                color: "#37393c",
                marginTop: 5,
              }}
            >
              {getOrderPhoneNum(orderInfo?.customer?.phoneNumber)}
            </BevietText>
          </View>
          

          <View style={[styles.divider, { marginVertical: 30 }]}/>
          
          <View style={{ paddingHorizontal: 15 }}>
            {orderInfo?.items.map((item: any, index: number) => {
              return (
                <View key={`${index}_item`}>
                  <View
                    style={{
                      marginTop: 5,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <BevietText>
                      <BevietBoldText style={{ color: "#000", fontSize: 14 }}>
                        {item.quantity}x{" "}
                      </BevietBoldText>
                      <BevietText style={{ fontSize: 14 }}>
                        {item.item_name}
                      </BevietText>
                    </BevietText>
                    <BevietText style={{ color: "#000", fontSize: 14 }}>
                      ${item.total_price.toFixed(2)}
                    </BevietText>
                  </View>
                  {item.modifiers &&
                    item.modifiers.map((modifier, i) => (
                      <View key={i}>
                        {modifier.modifiers &&
                          modifier.modifiers.map((x, j) => (
                            <BevietText key={j}>
                              <BevietText
                                style={{ color: "#000", fontSize: 14 }}
                              >
                                {x.modify_quantity > 1
                                  ? x.modify_quantity + "x   "
                                  : ""}
                              </BevietText>
                              <BevietText
                                style={{ color: "#000", fontSize: 14 }}
                              >
                                {x.modifyName.trim()}
                              </BevietText>
                            </BevietText>
                          ))}
                      </View>
                    ))}

                  <View style={[styles.dividerOrder, { marginVertical: 20 }]}/>
                </View>
              );
            })}
          </View>

          <View style={{ paddingHorizontal: 15 }}>
            <View
              style={{
                marginTop: 5,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <BevietText style={{ color: "#000", fontSize: 14 }}>
                  Subtotal
                </BevietText>
              </View>
              <BevietText
                style={{
                  fontSize: 14,
                  color: "#000",
                  marginTop: 2,
                }}
              >
                ${(orderInfo?.subtotal).toFixed(2)}
              </BevietText>
            </View>
            {order?.order_service == "delivery" && (
              <View
                style={{
                  marginTop: 5,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <BevietText style={{ color: "#000", fontSize: 14 }}>
                    Delivery fees
                  </BevietText>
                </View>
                <BevietText
                  style={{
                    fontSize: 14,
                    color: "#000",
                    marginTop: 2,
                  }}
                >
                  ${(orderInfo?.delivery_fee).toFixed(2)}
                </BevietText>
              </View>
            )}
            <View
              style={{
                marginTop: 10,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <BevietText style={{ color: "#000", fontSize: 14 }}>
                  Tips
                </BevietText>
              </View>
              <BevietText
                style={{
                  fontSize: 14,
                  color: "#000",
                  marginTop: 2,
                }}
              >
                ${(orderInfo?.tip_value).toFixed(2)}
              </BevietText>
            </View>
            <View
              style={{
                marginTop: 5,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <BevietBoldText
                  style={{
                    color: "#000",
                    fontSize: 14,
                  }}
                >
                  Tax & Fees
                </BevietBoldText>
              </View>
              <BevietText
                style={{
                  fontSize: 14,
                  color: "#000",
                  marginTop: 2,
                }}
              >
                ${(orderInfo?.tax).toFixed(2)}
              </BevietText>
            </View>
            {orderInfo?.loyalty_point_using > 0 && (
              <View
                style={{
                  marginTop: 5,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <BevietText
                    style={{
                      color: "#000",
                      fontSize: 14,
                    }}
                  >
                    Loyalty
                  </BevietText>
                </View>
                <BevietText
                  style={{
                    fontSize: 14,
                    color: "#000",
                    marginTop: 2,
                  }}
                >
                  - ${(orderInfo?.loyalty_point_using).toFixed(2)}
                </BevietText>
              </View>
            )}
            <View
              style={{
                marginTop: 5,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <BevietText style={{ color: "#000", fontSize: 14 }}>
                  Total
                </BevietText>
              </View>
              <BevietText
                style={{
                  fontSize: 14,
                  color: "#000",
                  marginTop: 5,
                }}
              >
                ${(orderInfo?.total_sum).toFixed(2)}
              </BevietText>
            </View>
          </View>

        </View>
      </ScrollView>
      }

      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

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
    paddingLeft: 15,
    paddingVertical: 20,
    // position: "absolute",
    // left: 10,
    // top: Constants.statusBarHeight + 8,
    // zIndex: 9999,
  },
  header: {
    paddingLeft: 15,
    // zIndex: 9998,
  },
  
  title: {
    fontSize: 30,
    color: "#000",
    // left: 10,
    // top: Constants.statusBarHeight + 20,
    marginBottom: 10,
  },
  state: {
    fontSize: 20,
    color: "#000",
    paddingHorizontal: -15,
    // top: Constants.statusBarHeight + 30,
    // marginBottom: 30,
  },
  divider: {
    height: 4,
    backgroundColor: "#ededed",
    width: "120%",
    left: -10,
  },
  dividerOrder: {
    height: 2,
    backgroundColor: "#ededed",
  },
});
