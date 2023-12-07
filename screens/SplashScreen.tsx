import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
} from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import Api from "../api/endpoints";
import Colors from "../constants/Colors";
import {
  ACCOUNT_URL_1,
  ACCOUNT_URL_2,
  ACCOUNT_URL_3,
  ACCOUNT_URL_4,
  BRANCHE_URL_1,
  BRANCHE_URL_2,
  BRANCHE_URL_3,
  BRANCHE_URL_4,
} from "../constants/GlobalConstants";
import useColorScheme from "../hooks/useColorScheme";
import { Landing, Root } from "../navigation/Helpers";
import { RootStackScreenProps } from "../types";
import { setGlobalState } from "../utils/Global";
import { getData, STORAGE_CART, STORAGE_USER } from "../utils/Helpers";

import { STYLE_COLOR_PRIMARY } from "../constants/GlobalConstants";

const primaryColor = STYLE_COLOR_PRIMARY;

export default function SplashScreen({ navigation, }: RootStackScreenProps<"Splash">) {
  
  const colorScheme = useColorScheme();
  

  // Functions:
  const checkStorage = async () => {
    let result1 = await getRestaurantDetails(ACCOUNT_URL_1, BRANCHE_URL_1);
    setGlobalState("address1", result1);
    let result2 = await getRestaurantDetails(ACCOUNT_URL_2, BRANCHE_URL_2);
    setGlobalState("address2", result2);
    let result3 = await getRestaurantDetails(ACCOUNT_URL_3, BRANCHE_URL_3);
    setGlobalState("address3", result3);
    let result4 = await getRestaurantDetails(ACCOUNT_URL_4, BRANCHE_URL_4);
    setGlobalState("address4", result4);

    // let time = [result1, result2, result3, result4];

    // time.map((h) => {
    //   console.log(h[0].deliveryData.name, " -> ", h[0].id);
    // })

    let cartData = await getData(STORAGE_CART);
      if (cartData) {
        setGlobalState("account_url", cartData.account_url);
        setGlobalState("branche_url", cartData.branche_url);
        if (cartData.account_url == ACCOUNT_URL_1) {
          setGlobalState("address", result1);
        } else if (cartData.account_url == ACCOUNT_URL_2) {
          setGlobalState("address", result2);
        } else if (cartData.account_url == ACCOUNT_URL_3) {
          setGlobalState("address", result3);
        } else {
          setGlobalState("address", result4);
        }
        setGlobalState("cart", cartData);
      }
      goToNextPage();
  };

  const getRestaurantDetails = async ( account_url: string, branche_url: string) => {

    let result = null;

    const addressResponse: any = await Api.getAddress(account_url);
    
    try {
      if (addressResponse) {
        if (addressResponse.data.status == 1) {
          result = addressResponse.data.data;
        }
      }
    } catch (error) {
      console.log("getRestaurantDetails/getAdress ERROR ->", error);
    }

    let params = {
      account_name: account_url,
    };

    const accountResponse: any = await Api.getAccountByAccountName(params);
    try {
      if (accountResponse) {
        if (accountResponse.data.status == 1) {
          if (result) {
            result[0].url = accountResponse.data.data.imageName;
          }
        }
      }
    } catch (error) {
      console.log("getRestaurantDetails/getAccountByAccountName ERROR ->", error);
    }

    let body = {
      account_url: account_url,
      outlet_url: branche_url,
      type: "delivery",
    };

    const timeResponse: any = await Api.checkOutletTime(body);
    try {
      if (timeResponse) {
        if (timeResponse.data.status == 1) {
          if (result) {
            result[0].delivery_open = timeResponse.data.data;
          }
        }
      }
    } catch (error) {
      console.log("getRestaurantDetails/checkOutletTimeDelivery ERROR ->", error);
    }

    let body1 = {
      account_url: account_url,
      outlet_url: branche_url,
      type: "pickup",
    };

    const time1Response: any = await Api.checkOutletTime(body1);
    try {
      if (time1Response) {
        if (time1Response.data.status == 1) {
          if (result) {
            result[0].pickup_open = time1Response.data.data;
          }
        }
      }
    } catch (error) {
      console.log("getRestaurantDetails/checkOutletTimePickup ERROR ->", error);
    }

    const deliveryDataResponse: any = await Api.getDeliveryData(account_url, branche_url);
    
    try {
      if (deliveryDataResponse) {
        if (deliveryDataResponse.data.status == 1) {
          result[0].deliveryData = deliveryDataResponse.data.data;
        }
      }
    } catch (error) {
      console.log("getRestaurantDetails/getDeliveryData ERROR ->", error);
    }

    // console.log("Restaurant", account_url, branche_url, " ->", result);
    return result;
  };

  const goToNextPage = async () => {
    let user = await getData(STORAGE_USER);

    if (user) {
      setGlobalState("token", user.token);
      const response: any = await Api.getCustomerInfo();
      if (response) {
        if (response.data.status == 1) {
          navigation.replace(Root);
        } else {
          navigation.replace(Landing);
        };
      } else {
        navigation.replace(Root);
      }
    } else {
      navigation.replace(Landing);
    }
  };

  const createRestartAlert = () =>
    Alert.alert(
      "Network issue",
      "We cannot get data from server, please check your network and restart app.",
      [
        {
          text: "OK",
          onPress: () => {},
        },
      ]
  );

  // LifeCycle:
  useEffect(() => {
    checkStorage();
  }, []);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <Image source={require("../assets/images/splash.png")} style={styles.splash} />
      <ActivityIndicator size="large" color={primaryColor} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  splash: {
    resizeMode: Platform.OS == "ios" ? "contain" : "cover",
    width: 200,
    height: 200,
  },
});
