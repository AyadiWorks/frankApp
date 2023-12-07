import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import SVGIcon from "../assets/images/ic_order_placed.svg";
import SVGBg from "../assets/images/ic_order_placed_bg.svg";
import Button from "../components/Button";
import Colors from "../constants/Colors";
import {
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY, STYLE_COLOR_PRIMARY
} from "../constants/GlobalConstants";
import useColorScheme from "../hooks/useColorScheme";
import { Root } from "../navigation/Helpers";
import { RootStackScreenProps } from "../types";

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;

var width = Dimensions.get("window").width; //full width
var height = Dimensions.get("window").height; //full height

export default function OrderPlacedScreen({
  navigation,
}: RootStackScreenProps<"OrderPlaced">) {
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  useEffect(() => {}, []);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <SVGBg width={width} height={height} />
      </View>
      <View style={{ alignItems: "center", flex: 1, justifyContent: "center" }}>
        <SVGIcon />
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <Text
            style={{
              color: textColorPrimary,
              fontSize: 22,
              fontWeight: "bold",
            }}
          >
            Congratulations!
          </Text>
          <Text style={{ color: textColorPrimary, fontSize: 14 }}>
            Your order is placed successfully enjoy the food!
          </Text>
        </View>
      </View>
      <View style={{ position: "absolute", bottom: 20, width: "100%" }}>
        <Button
          label="Done"
          onPress={() => {
            navigation.navigate(Root);
          }}
          containerStyle={{
            borderRadius: 25,
            flex: 1,
            backgroundColor: primaryColor,
            marginHorizontal: 20,
          }}
          textStyle={{ color: "#FFF", flex: 1, fontWeight: "bold" }}
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
});
