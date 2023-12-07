import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import {
  Dimensions, ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator
} from "react-native";
import ChatButton from "../components/ChatButton";
import SafeAreaView from "react-native-safe-area-view";
import { useToast } from "react-native-toast-notifications";
import Colors from "../constants/Colors";
import {
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY,
  STYLE_COLOR_PRIMARY
} from "../constants/GlobalConstants";
import useColorScheme from "../hooks/useColorScheme";
import { RootTabScreenProps } from "../types";
import SvgFrank from "../assets/images/frank.svg";
import Api from "../api/endpoints";
import { BevietBoldText, BevietText } from "../components/Text";

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;

var width = Dimensions.get("window").width; //full width
var height = Dimensions.get("window").height; //full height

export default function TabLoyaltyScreen({
  navigation,
}: RootTabScreenProps<"TabLoyalty">) {
  const colorScheme = useColorScheme();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [loyalty, setLoyalty] = useState(0);

  useEffect(() => {
    getLoyalPoint()
  }, []);

  const getLoyalPoint = async () => {
    const response: any = await Api.getLoyalPoint();
    try {
      if (response) {
        if (response.data.status == 1) {
          // console.log("Loyalty DATA ->", response.data)
          setLoyalty(response.data.data);
          setLoading(false);
        }
      }
    } catch (error) {
      console.log("Error getting Loyalty", error);
    }
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <ScrollView contentContainerStyle={{ padding: 15 }}>
        
        <BevietBoldText style={{ fontSize: 30, color: '#181818', marginTop: 20 }}>Frank's Points</BevietBoldText>
        <View style={{ alignItems: 'center', marginTop: 15 }}>
          <SvgFrank />
          <View style={{ alignItems: 'center', borderRadius: 100, borderColor: primaryColor, borderWidth: 1, padding: 8, paddingHorizontal: 25, marginTop: -35, backgroundColor: '#fff' }}>
            <BevietText style={{ fontSize: 15, color: primaryColor }}>Loyalty balance</BevietText>
            {loading
            ?
            <ActivityIndicator size={"small"} color={primaryColor} style={{paddingTop: 2}} />
            :
            <BevietText style={{ fontSize: 15, color: "#020202" }}>${loyalty.toFixed(2)}</BevietText>
            }
          </View>
        </View>
        <Text style={{ fontSize: 25, fontFamily: 'pacifico', color: primaryColor, marginTop: 20 }}>
          We are Loyal to
        </Text>
        <Text style={{ fontSize: 25, fontFamily: 'pacifico', color: primaryColor, marginLeft: 100 }}>
          our loyal customers..
        </Text>
        <BevietText style={{ fontSize: 18, color: "#020202", marginTop: 20 }}>FAQs:</BevietText>
        <BevietText style={{ fontSize: 18, color: "#020202", marginTop: 15 }}>How Does loyalty work?</BevietText>
        <BevietText style={{ fontSize: 18, color: "#020202", marginTop: 10 }}>Lorem ipsum is placeholder text commonly
          used in the graphic, print, and publishing
          industries for previewing layouts and visual
          mockups.
        </BevietText>
        <BevietText style={{ fontSize: 18, color: "#020202", marginTop: 15 }}>How Does loyalty work?</BevietText>
        <BevietText style={{ fontSize: 18, color: "#020202", marginTop: 10 }}>Lorem ipsum is placeholder text commonly
          used in the graphic, print, and publishing
          industries for previewing layouts and visual
          mockups.
        </BevietText>
        <BevietText style={{ fontSize: 18, color: "#020202", marginTop: 15 }}>How Does loyalty work?</BevietText>
        <BevietText style={{ fontSize: 18, color: "#020202", marginTop: 10 }}>Lorem ipsum is placeholder text commonly
          used in the graphic, print, and publishing
          industries for previewing layouts and visual
          mockups.
        </BevietText>
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
});
