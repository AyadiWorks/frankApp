import { useIsFocused } from "@react-navigation/native";
import { create } from "apisauce";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  View,
  StatusBar,
} from "react-native";
import ChatButton from '../components/ChatButton';

import Constants from "expo-constants";
import { Button as ButtonPaper } from "react-native-paper";
import { useToast } from "react-native-toast-notifications";
import SvgGlass from "../assets/images/glass.svg";
import { BevietBoldText } from "../components/Text";
import Colors from "../constants/Colors";

import {
  API_POS_QRCODE,
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY,
  STYLE_COLOR_PRIMARY,
} from "../constants/GlobalConstants";

import useColorScheme from "../hooks/useColorScheme";
import { PosOrder } from "../navigation/Helpers";
import { RootTabScreenProps } from "../types";
import { BarCodeScanner } from "expo-barcode-scanner";
import {
  QRScannerView,
  QRScannerRectView,
} from "../utils/react-native-qrcode-scanner-view-custom";

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;

var width = Dimensions.get("window").width; //full width
var height = Dimensions.get("window").height; //full height

export default function TabScanScreen({ navigation }: RootTabScreenProps<"TabScan">) {

  const colorScheme = useColorScheme();
  const [loyalPoint, setLoyalPoint] = useState(0);
  const isFocused = useIsFocused();
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const toast = useToast();

  const POS_URL = API_POS_QRCODE;
  const posClient = create({
    baseURL: POS_URL,
  });

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    if (!isFocused) {
      setShowScan(false);
      StatusBar.setHidden(false);
    } else {
      StatusBar.setHidden(true);
    }
  }, [isFocused]);

  const handleBarCodeScanned = async ({
    type,
    data,
    bound,
    cornerPoints,
  }: any) => {
    // console.log("--------------------------------");
    if (cornerPoints) {
      setScanned(true);
      let y1 = cornerPoints[0].y;
      let y2 = cornerPoints[3].y;
      let x1 = cornerPoints[0].x;
      let x2 = cornerPoints[2].x;
      if (
        y1 > 300 &&
        y2 < 300 + 250 &&
        x1 > width / 2 - 125 &&
        x2 < width / 2 + 125
      ) {
        if (scanned == false) {
          posClient.get(data)
          .then(async (response: any) => {
            if (isFocused) {
              if (response.data.type == "success") {
                setShowScan(false);
                setScanned(false);

                // Filtring orders with price === 0
                let allData = response.data.data;
                let orderFiltred = await allData?.items.filter((item: any) => item.price !== 0);
                allData.items = orderFiltred;
                
                navigation.navigate(PosOrder, {
                  // order: response.data.data,
                  order: allData,
                  id: data,
                });
              } else {
                toast.show("Wrong Secret ID.", {
                  type: "danger",
                  placement: "top",
                });
                setScanned(false);
              }
            }
          });
        }
      } else {
        setScanned(false);
      }
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
        }}
      >
        {showScan && (
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={{ width: width, height: height }}
            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
          />
        )}
        <View
          style={{
            position: "absolute",
            top: 0,
            width: width,
            height: height,
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              opacity: 0.3,
              height: 300,
              width: "100%",
            }}
          ></View>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <View
              style={{ backgroundColor: "#fff", opacity: 0.3, flex: 1 }}
            ></View>
            <View
              style={{
                height: 250,
                width: 250,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 15,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            ></View>
            <View
              style={{ backgroundColor: "#fff", opacity: 0.3, flex: 1 }}
            ></View>
          </View>
          <View
            style={{
              backgroundColor: "#fff",
              opacity: 0.3,
              flex: 1,
              width: "100%",
            }}
          ></View>
        </View>
        <View
          style={{
            position: "absolute",
            top: 110,
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <SvgGlass preserveAspectRatio="none" width={152} height={55} />
          <BevietBoldText
            style={{
              fontSize: 26,
              color: showScan ? "#FFF" : textColorPrimary,
              textAlign: "center",
              marginTop: 10,
            }}
          >
            Scan To Pay
          </BevietBoldText>
        </View>
        <View
          style={{
            position: "absolute",
            top: 300,
          }}
        >
          <QRScannerRectView
            scanBarAnimateReverse={true}
            isShowScanBar={showScan}
          />
        </View>
        {!showScan && (
          <ButtonPaper
            style={{
              backgroundColor: "rgba(20,67,51,0.85)",
              borderRadius: 25,
              width: "85%",
              alignSelf: "center",
              position: "absolute",
              bottom: 60,
              paddingVertical: 3,
            }}
            labelStyle={{
              fontSize: 18,
              color: "#FFF",
              fontFamily: "beviet-bold",
            }}
            color={"#000"}
            mode="contained"
            onPress={() => {
              if (!hasPermission) {
                toast.show("No access to camera", {
                  type: "danger",
                  placement: "top",
                });
              } else {
                setShowScan(true);
              }
            }}
          >
            SCAN NOW
          </ButtonPaper>
        )}
      </View>

      <ChatButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 15,
  },
});
