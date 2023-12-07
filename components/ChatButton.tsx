import React, { useState } from "react";
import { StyleSheet, Text, Pressable, Dimensions } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from "@expo/vector-icons";

import {
  STYLE_COLOR_PRIMARY,
} from "../constants/GlobalConstants";

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

export default function ChatButton() {


  const [result, setResult] = useState<any>(null);

  const _handlePressButtonAsync = async () => {
    let result = await WebBrowser.openBrowserAsync('https://tawk.to/chat/60576271067c2605c0bac0e1/1f1alh3em');
    setResult(result);
  };

  return (
      <Pressable style={styles.chatBtn} onPress={_handlePressButtonAsync}>
        <Ionicons name="chatbox" size={30} color="#fff" />
      </Pressable>
  );
};

const styles = StyleSheet.create({
  chatBtn: {
    height: 50,
    width: 50,
    borderRadius: 50,
    backgroundColor: STYLE_COLOR_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top : deviceHeight - 145,
    left: deviceWidth - 60,
  }
});
