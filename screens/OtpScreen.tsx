import React, { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import md5 from "md5";

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import SafeAreaView from "react-native-safe-area-view";
import { useToast } from "react-native-toast-notifications";
import Api from "../api/endpoints";
import Button from "../components/Button";
import { BevietBoldText, BevietText } from "../components/Text";
import Colors from "../constants/Colors";
import {
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY,
  STYLE_COLOR_PRIMARY,
} from "../constants/GlobalConstants";
import useColorScheme from "../hooks/useColorScheme";
import { Register, Root } from "../navigation/Helpers";
import { RootStackScreenProps } from "../types";
import { setGlobalState } from "../utils/Global";
import { STORAGE_USER, storeData } from "../utils/Helpers";
import { MaterialIcons } from "@expo/vector-icons";

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;
const CELL_COUNT = 5;
export default function OtpScreen({
  navigation,
  route,
}: RootStackScreenProps<"Otp">) {
  const country = route.params?.country;
  const countryCode = route.params?.countryCode;
  const phone = route.params?.phone;
  const sms = route.params?.sms;
  const [loading, setLoading] = useState(false);
  const [resendTime, setResendTime] = useState(60);
  const [availableResend, setAvailableResend] = useState(false);
  const toast = useToast();

  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const colorScheme = useColorScheme();

  useEffect(() => {
    let interval = setInterval(() => {
      setResendTime((prev) => {
        if (prev < 1) {
          setAvailableResend(true);
          return 0;
        } else {
          return prev - 1;
        }
      });
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  let clientid = md5("!@#" + countryCode + phone);

  const authOtp = async (code: any) => {
    Keyboard.dismiss();
    setLoading(true);


    let body = {
      code: code,
      phoneNumber: phone,
      countryCode: countryCode,
      clientId: clientid,
    };
    // console.log("Sending body", body);

    let response: any = await Api.authOtpVerification(body, code);
    console.log('test', response)

    if (response.data.status == 1) {
      await storeData(STORAGE_USER, JSON.stringify(response.data.data));
      setGlobalState("token", response.data.data.token);
      setLoading(false);
      navigation.replace(Root);
    } else {
      if (response.data.message == "User not found") {
        navigation.replace(Register, {
          phone: phone,
          country: country,
          countryCode: countryCode,
        });
      } else {
        toast.show(response.data.message, {
          type: "danger",
          placement: "top",
        });
        setLoading(false);
      }
    }
  };

  const resendOtp = async () => {
    let body = {
      to: phone,
      countryCode: countryCode,
    };
    setLoading(true);
    const response = await Api.sendSms(body);
    console.log('test', response)
    setResendTime(60);
    setLoading(false);
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
        <View style={{ width: "100%", justifyContent: "center" }}>
          <TouchableOpacity
            style={{ padding: 10, marginLeft: 10 }}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons
              name="arrow-back-ios"
              size={25}
              color={primaryColor}
            />
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 80, alignItems: "center" }}>
          <Image
            source={require("../assets/images/logos.png")}
            style={{ width: 210, height: 90 }}
            resizeMode="contain"
          />
        </View>
        <View style={{ marginHorizontal: 20, marginTop: 10 }}>
          <BevietBoldText
            style={{
              fontSize: 27,
              color: textColorPrimary,
              textAlign: "center",
            }}
          >
            Verify your number
          </BevietBoldText>
        </View>
        <View
          style={{
            flex: 1,
            marginVertical: 40,
            marginHorizontal: 20,
            alignItems: "center",
          }}
        >
          <CodeField
            ref={ref}
            {...props}
            caretHidden={false}
            value={value}
            onChangeText={setValue}
            cellCount={CELL_COUNT}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({ index, symbol, isFocused }) => (
              <BevietText
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}
                onLayout={getCellOnLayoutHandler(index)}
              >
                {symbol || (isFocused ? <Cursor /> : null)}
              </BevietText>
            )}
          />
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginTop: 30,
            }}
          >
            <BevietBoldText style={{ fontSize: 15, color: textColorPrimary }}>
              Didn't receive code.
            </BevietBoldText>
            <TouchableOpacity
              disabled={!availableResend}
              onPress={() => {
                if (availableResend) resendOtp();
              }}
            >
              <BevietBoldText style={{ fontSize: 15, color: primaryColor }}>
                {resendTime == 0 ? "Resend" : `Resend (${resendTime}s)`}
              </BevietBoldText>
            </TouchableOpacity>
          </View>

          <Button
            label="Continue"
            onPress={() => {
              if (!loading) {
                if (value.length == 5) {
                  authOtp(value);
                } else {
                  toast.show("Please input verification code.", {
                    type: "danger",
                    placement: "top",
                  });
                }
              }
            }}
            // onPress={() => {
            //   authOtp(value);
            // }}
            containerStyle={{
              marginHorizontal: 20,
              backgroundColor: primaryColor,
              borderRadius: 25,
              width: "95%",
              marginTop: 30,
            }}
            loading={loading}
            textStyle={{ color: "#fff", fontWeight: "bold" }}
          />
        </View>

        {/* <View style={{ marginBottom: 20 }}>
          <Button
            label="Continue"
            onPress={() => {
              if (!loading) {
                if (value.length == 5) {
                  authOtp(value);
                } else {
                  toast.show("Please input verification code.", {
                    type: "danger",
                    placement: "top",
                  });
                }
              }
            }}
            containerStyle={{
              marginHorizontal: 20,
              backgroundColor: primaryColor,
              borderRadius: 25,
            }}
            loading={loading}
            textStyle={{ color: "#fff", fontWeight: "bold" }}
          />
        </View> */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  phoneInput: {
    borderColor: "#ddd",
    borderWidth: 2,
    borderRadius: 2,
    padding: 16,
  },
  codeFieldRoot: { marginTop: 20 },
  cell: {
    width: 50,
    height: 50,
    lineHeight: 38,
    fontSize: 28,
    borderWidth: 1,
    marginHorizontal: 8,
    borderColor: primaryColor,
    textAlign: "center",
    borderRadius: 5,
    paddingTop: 5,
  },
  focusCell: {
    borderColor: "#000",
  },
});
