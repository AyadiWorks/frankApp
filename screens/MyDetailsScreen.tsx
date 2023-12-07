import { FontAwesome } from "@expo/vector-icons";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import { useToast } from "react-native-toast-notifications";
import Api from "../api/endpoints";
import Colors from "../constants/Colors";
import {
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY, STYLE_COLOR_PRIMARY
} from "../constants/GlobalConstants";
import useColorScheme from "../hooks/useColorScheme";
import { EditProfile } from "../navigation/Helpers";
import { RootStackScreenProps } from "../types";
import { Ionicons } from "@expo/vector-icons";


const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;

export default function MyDetailsScreen({
  navigation,
  route,
}: RootStackScreenProps<"MyDetails">) {
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const colorScheme = useColorScheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    getCustomer();
  }, []);

  const getCustomer = async () => {
    let response: any = await Api.getCustomerInfo();
    try {
      if (response.data.status) setName(response.data.data.name);
      setPhone(response.data.data.phone);
      setEmail(response.data.data.email);
    } catch (error) {}
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorScheme].background,
        },
      ]}
    >
      <View style={styles.backButton}>
        <TouchableOpacity style={styles.backCircle} onPress={() => { navigation.goBack() }}>
          <Ionicons name="arrow-back" size={27} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>My Account</Text>
      </View>
      <View style={styles.editButton}>
        <TouchableOpacity onPress={() => { navigation.navigate(EditProfile) }}>
          <FontAwesome name="edit" size={26} color={primaryColor} />
        </TouchableOpacity>
      </View>
      <View
        style={{
          marginHorizontal: 15,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 15,
            // borderBottomWidth: 1,
            // borderColor: "#B4B4B4",
            borderRadius: 16,
            paddingHorizontal: 10,
            marginTop: 30,
            backgroundColor: "#FBFBFB",
          }}
        >
          <Text style={{ fontSize: 14, color: "#B4B4B4", marginTop: 15 }}>
            Full Name
          </Text>
          <Text
            style={{ fontSize: 14, color: textColorPrimary, marginTop: 15 }}
          >
            {name}
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 15,
            borderRadius: 16,
            paddingHorizontal: 10,
            marginTop: 30,
            backgroundColor: "#FBFBFB",
          }}
        >
          <Text style={{ fontSize: 14, color: "#B4B4B4", marginTop: 15 }}>
            Phone Number
          </Text>
          <Text
            style={{ fontSize: 14, color: textColorPrimary, marginTop: 15 }}
          >
            {phone}
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 15,
            borderRadius: 16,
            paddingHorizontal: 10,
            marginTop: 30,
            backgroundColor: "#FBFBFB",
          }}
        >
          <Text style={{ fontSize: 14, color: "#B4B4B4", marginTop: 15 }}>
            Email
          </Text>
          <Text
            style={{ fontSize: 14, color: textColorPrimary, marginTop: 15 }}
          >
            {email}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  backCircle: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#FFF",
  },

  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  backButton: {
    position: "absolute",
    left: 10,
    top: Constants.statusBarHeight + 3,
    zIndex: 9999,
    marginLeft: 10,
  },
  editButton: {
    position: "absolute",
    right: 10,
    top: Constants.statusBarHeight + 10,
    zIndex: 9999,
    marginRight: 10,
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
