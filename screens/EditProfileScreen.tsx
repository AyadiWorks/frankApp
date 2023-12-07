import { FontAwesome } from "@expo/vector-icons";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  View
} from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import { useToast } from "react-native-toast-notifications";
import Api from "../api/endpoints";
import Button from "../components/Button";
import Colors from "../constants/Colors";
import {
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY, STYLE_COLOR_PRIMARY
} from "../constants/GlobalConstants";
import useColorScheme from "../hooks/useColorScheme";
import { RootStackScreenProps } from "../types";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";


const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;

export default function EditProfileScreen({
  navigation,
  route,
}: RootStackScreenProps<"EditProfile">) {
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

  const saveInfo = async () => {
    if (!loading) {
      setLoading(true);
      let body = { name, phone, email };
      let response: any = await Api.editCustomerInfo(body);
      try {
        if (response.data.status) {
          toast.show("Saved", {
            type: "success",
            placement: "top",
          });
        } else {
          toast.show(response.data.message, {
            type: "danger",
            placement: "top",
          });
        }
      } catch (error) {}
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backCircle} onPress={() => { navigation.goBack() }}>
          <Ionicons name="arrow-back" size={27} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>My Account</Text>

        <View style={styles.backCircle}>
          <Ionicons name="arrow-back" size={27} color="#fff" />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <View style={styles.body}>
          <ScrollView>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>

              <TextInput
                placeholder="Full Name"
                onChangeText={(text: string) => {
                  setName(text);
                }}
                value={name}
                placeholderTextColor={"#B4B4B4"}
                style={styles.input}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <Text style={styles.label}>{phone}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>

              <TextInput
                placeholder="Email"
                onChangeText={(text: string) => {
                  setEmail(text);
                }}
                value={email}
                placeholderTextColor={"#B4B4B4"}
                style={styles.input}
              />
            </View>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <Button
            label={"Save"}
            onPress={() => {saveInfo();}}
            loading={loading}
            containerStyle={styles.saveBtn}
            textStyle={{ color: "#FFF", fontWeight: "bold" }}
          />
        </View>
      </KeyboardAvoidingView>

    </View>
  );
}

const styles = StyleSheet.create({

  saveBtn: {
    borderRadius: 10,
    backgroundColor: primaryColor,
    marginVertical: 15,
    marginHorizontal: 15,
  },

  inputContainer: {
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: "#FBFBFB",
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 16,
  },

  label: {
    fontSize: 14,
    color: "#B4B4B4",
    borderColor: "#B4B4B4",
  },

  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#B4B4B4",
    paddingLeft: 10,
    borderRadius: 6,
    marginTop: 5,
    color: textColorPrimary,
  },

  backCircle: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#FFF",
  },

  body: {
    flex: 5,
    paddingHorizontal: 20,
    paddingTop: 20,
    // backgroundColor: "red",
  },
  
  footer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    // backgroundColor: "yellow",
  },

  container: {
    flex: 1,
    backgroundColor: "#fff",
    // paddingTop: Constants.statusBarHeight,
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Constants.statusBarHeight,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    color: primaryColor,
    fontWeight: "bold",
    textAlign: "center",
  },
});
