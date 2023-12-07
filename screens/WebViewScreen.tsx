import { FontAwesome } from "@expo/vector-icons";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, StyleSheet, TouchableOpacity, View
} from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import { useToast } from "react-native-toast-notifications";
import { WebView } from "react-native-webview";
import Colors from "../constants/Colors";
import {
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY, STYLE_COLOR_PRIMARY
} from "../constants/GlobalConstants";
import useColorScheme from "../hooks/useColorScheme";
import { RootStackScreenProps } from "../types";

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;

export default function WebViewScreen({
  navigation,
  route,
}: RootStackScreenProps<"WebView">) {
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const colorScheme = useColorScheme();
  const url = route.params?.url;

  useEffect(() => {}, []);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <WebView
        source={{ uri: url }}
        onLoadEnd={(syntheticEvent) => {
          setLoading(false);
        }}
        style={{}}
      />
      {loading && (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            alignSelf: "center",
            bottom: 0,
            top: 0,
          }}
        >
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      )}
      <View style={styles.backButton}>
        <TouchableOpacity
          onPress={() => {
            if (!loading) navigation.goBack();
          }}
        >
          <FontAwesome
            name="arrow-circle-left"
            size={30}
            color={primaryColor}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  backButton: {
    position: "absolute",
    left: 10,
    top: Constants.statusBarHeight + 10,
    zIndex: 9999,
  },
});
