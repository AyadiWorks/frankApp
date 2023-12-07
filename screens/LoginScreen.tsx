import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import md5 from "md5";
import PhoneInput from "react-native-phone-number-input";
import SafeAreaView from "react-native-safe-area-view";
import { useToast } from "react-native-toast-notifications";
import Api from "../api/endpoints";
import Button from "../components/Button";
import Colors from "../constants/Colors";
import {
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY,
  STYLE_COLOR_PRIMARY,
} from "../constants/GlobalConstants";
import useColorScheme from "../hooks/useColorScheme";
import { Otp } from "../navigation/Helpers";
import { RootStackScreenProps } from "../types";

import { BevietBoldText, BevietText } from "../components/Text";

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;

export default function LoginScreen({
  navigation,
}: RootStackScreenProps<"Login">) {
  const [phone, setPhone] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const phoneInput = useRef<PhoneInput>(null);
  const toast = useToast();
  const colorScheme = useColorScheme();

  const sendOTP = async () => {
    Keyboard.dismiss();
    setLoading(true);
    let countryCode = "+" + phoneInput.current?.getCallingCode();
    let country = phoneInput.current?.getCountryCode();
    let tempPhone = phone;
    if (tempPhone.includes(countryCode)) {
      tempPhone = tempPhone.replace(countryCode, "");
    }

    const clientId = md5("!@#" + countryCode + tempPhone);

    const body = {
      phoneNumber: tempPhone,
      countryCode: countryCode,
      clientId: clientId,
      channel: "sms",
    };


    const response: any = await Api.sendSmsVerification(body);

    console.log("Resp verif sms", response);
    if (response) {
      if (response.data.status == 1) {
        navigation.navigate(Otp, {
          phone: tempPhone,
          sms: response.data.data,
          countryCode,
          country,
        });
      } else {
        toast.show("We cannot send sms to this number.", {
          type: "danger",
          placement: "top",
        });
      }
    } else {
      toast.show("We cannot send sms to this number.", {
        type: "danger",
        placement: "top",
      });
    }
    setLoading(false);
  };

  const checkOtp = () => {
    if (phoneInput.current?.isValidNumber(phone)) {
      if (!loading) {
        sendOTP();
      }
    } else {
      toast.show("Please input phone number correctly.", {
        type: "danger",
        placement: "top",
      });
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={{ marginTop: 60, alignItems: "center" }}>
          <Image
            source={require("../assets/images/logos.png")}
            style={{ width: 210, height: 90 }}
            resizeMode="contain"
          />
        </View>

        <View
          style={{ alignItems: "center", marginHorizontal: 20, marginTop: 20 }}
        >
          <BevietBoldText style={{ fontSize: 25, color: textColorPrimary }}>
            What's your number?
          </BevietBoldText>
        </View>

        <View
          style={{
            marginTop: 0,
            flex: 1,
            marginHorizontal: 20,
            alignItems: "center",
          }}
        >
          <PhoneInput
            ref={phoneInput}
            defaultCode={"US"}
            layout="second"
            onChangeFormattedText={(text) => {
              setFormattedPhone(text);
            }}
            onChangeText={(text) => {
              setPhone(text);
            }}
            containerStyle={styles.input}
            textContainerStyle={styles.inputTxt}
          />

          <Button
            onPress={() => checkOtp()}
            label="Get OTP"
            loading={loading}
            containerStyle={styles.btn}
            textStyle={{ color: "#fff", fontWeight: "bold" }}
          />
        </View>

        {/* <View style={{ marginBottom: 20 }}>
          <Button
            onPress={() => {
              if (phoneInput.current?.isValidNumber(phone)) {
                if (!loading) {
                  sendOTP();
                }
              } else {
                toast.show("Please input phone number correctly.", {
                  type: "danger",
                  placement: "top",
                });
              }
            }}
            label="Get OTP"
            loading={loading}
            containerStyle={{
              marginHorizontal: 20,
              paddingVertical: 12,
              backgroundColor: primaryColor,
              borderRadius: 25,
            }}
            textStyle={{ color: "#fff", fontWeight: "bold" }}
          ></Button>
        </View> */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputTxt: {
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
    borderColor: primaryColor,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    width: "95%",
    borderColor: "#707070",
    // marginTop: 30,
    marginVertical: 50,
  },

  btn: {
    marginHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: primaryColor,
    borderRadius: 25,
    width: "95%",
    marginTop: 30,
  },

  container: {
    flex: 1,
  },
  phoneInput: {
    borderColor: "#ddd",
    borderWidth: 2,
    borderRadius: 2,
    padding: 16,
  },
});
