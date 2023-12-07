import { Entypo, FontAwesome } from "@expo/vector-icons";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import StepIndicator from "react-native-step-indicator";
import { useToast } from "react-native-toast-notifications";
import Colors from "../constants/Colors";
import {
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY, STYLE_COLOR_PRIMARY
} from "../constants/GlobalConstants";
import useColorScheme from "../hooks/useColorScheme";
import { RootStackScreenProps } from "../types";

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;

export default function OrderTrackScreen({
  navigation,
  route,
}: RootStackScreenProps<"OrderTrack">) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const colorScheme = useColorScheme();

  const [position, setPosition] = useState(0);
  const order = route.params?.order;
  const orderInfo = route.params?.orderInfo;

  const labels = ["Order Confirmed", "Order Accepted", "Order Completed"];
  const labels_description = [
    "Your order has been received",
    "Your order has been accepted",
    "Your order has been completed",
  ];
  const customStyles = {
    stepIndicatorSize: 30,
    currentStepIndicatorSize: 30,
    separatorStrokeWidth: 1,
    currentStepStrokeWidth: 0,
    stepStrokeCurrentColor: "#fe7013",
    stepStrokeWidth: 2,
    stepStrokeFinishedColor: "#fe7013",
    stepStrokeUnFinishedColor: "#DDDDDD",
    separatorFinishedColor: "#fe7013",
    separatorUnFinishedColor: "#DDDDDD",
    stepIndicatorFinishedColor: "#fe7013",
    stepIndicatorUnFinishedColor: "#DDDDDD",
    stepIndicatorCurrentColor: "#DDDDDD",
    stepIndicatorLabelFontSize: 15,
    currentStepIndicatorLabelFontSize: 15,
    stepIndicatorLabelCurrentColor: "#fe7013",
    stepIndicatorLabelFinishedColor: "#ffffff",
    stepIndicatorLabelUnFinishedColor: "#aaaaaa",
    labelColor: textColorPrimary,
    labelSize: 13,
    currentStepLabelColor: textColorPrimary,
  };

  useEffect(() => {
    if (order.status_order == "PLACED") {
      setPosition(1);
    } else if (order.status_order == "ready") {
      setPosition(2);
    } else if (orderInfo.status == "completed") {
      setPosition(3);
    }
  }, []);

  console.log(orderInfo);

  const renderStep = () => {
    return <Entypo name="check" color={"#FFF"} size={14}></Entypo>;
  };

  const renderLabel = (e: any) => {
    return (
      <View>
        <Text style={{ color: "#000" }}>{e.label}</Text>
        <Text style={{ color: "#898B9A" }}>
          {labels_description[e.position]}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View style={styles.backButton}>
        <TouchableOpacity
          onPress={() => {
            if (!loading) navigation.goBack();
          }}
        >
          <FontAwesome
            name="arrow-circle-left"
            size={30}
            color={primaryColor}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>TRACK ORDER</Text>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 15 }}>
        <StepIndicator
          customStyles={customStyles}
          currentPosition={position}
          labels={labels}
          direction="vertical"
          renderStepIndicator={renderStep}
          renderLabel={renderLabel}
          stepCount={3}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  backButton: {
    position: "absolute",
    left: 10,
    top: Constants.statusBarHeight + 10,
    zIndex: 9999,
  },
  header: {
    marginTop: 10,
    zIndex: 9998,
  },
  title: {
    fontSize: 22,
    color: primaryColor,
    fontWeight: "bold",
    textAlign: "center",
  },
});
