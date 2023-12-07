import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackScreenProps } from "../types";

import { BevietBoldText, BevietText } from "../components/Text";

import { STYLE_COLOR_PRIMARY } from "../constants/GlobalConstants";

const primaryColor = STYLE_COLOR_PRIMARY;

export default function NoInternetScreen({ navigation }: RootStackScreenProps<"NoInternet">) {

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="wifi-off" size={150} color="black" style={{ marginBottom: 30, }} />
      <BevietBoldText style={{ fontSize: 25, marginBottom: 10 }}>No internet Connection</BevietBoldText>
      <BevietText style={{ fontSize: 10, paddingHorizontal: 70, }}>Your internet connection is currently not available please check or try again.</BevietText>

      <Pressable style={styles.btn} onPress={() => navigation.navigate("Splash")}>
        <BevietBoldText style={{ fontSize: 17, color: "#FFF" }}>Try Again</BevietBoldText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({

  btn: {
    width: "70%",
    backgroundColor: primaryColor,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 40,
  },

  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  }
});
