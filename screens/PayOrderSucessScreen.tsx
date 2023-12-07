import React from "react";
import { StyleSheet, View, Pressable, Image } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackScreenProps } from "../types";

import { BevietBoldText, BevietText } from "../components/Text";

import { STYLE_COLOR_PRIMARY } from "../constants/GlobalConstants";

import { TabHome, MyOrders } from "../navigation/Helpers";

const primaryColor = STYLE_COLOR_PRIMARY;

export default function PayOrderSucessScreen({ navigation }: RootStackScreenProps<"PayOrderSucess">) {

  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/checked.png")} style={styles.img} />
      <BevietBoldText style={{ fontSize: 25, marginBottom: 10 }}>Thank You!</BevietBoldText>

      <Pressable style={styles.btn} onPress={() => navigation.navigate(MyOrders)}>
        <BevietBoldText style={{ fontSize: 17, color: "#FFF" }}>View my Receipts</BevietBoldText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({

  img: {
    height: 150,
    width: 150,
    resizeMode: "contain",
    marginBottom: 20,
  },

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
