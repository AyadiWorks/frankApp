import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import { useToast } from "react-native-toast-notifications";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import Api from "../api/endpoints";
import Colors from "../constants/Colors";
import { GOOGLE_KEY } from "../constants/GlobalConstants";
import Layout from "../constants/Layout";
import useColorScheme from "../hooks/useColorScheme";
import { DeliveryAddressDetails } from "../navigation/Helpers";
import { RootStackScreenProps } from "../types";
import { getGlobalState } from "../utils/Global";
import LocationView from "../utils/locationview";

export default function MapViewScreen({ navigation, route }: RootStackScreenProps<"MapView">) {

  const initRegion = route.params?.region;
  const editAddress = route.params?.edit;
  const addressId = route.params?.id;
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState(initRegion);
  const toast = useToast();
  const colorScheme = useColorScheme();

  const confirmLocation = async (e: any) => {
    if (!loading) {
      setLoading(true);
      let formatted_address = e.address;
      let location = {
        lat: e.latitude,
        lng: e.longitude
      }
      const body = { ...location, location: formatted_address };
      let response: any = await Api.selectDeliveryAddress(body);
      try {
        if (response.data.status) {
          let areaId = response.data.data.areaId;
          let address = {}
          if (e.placeDetails.address_components.length > 8) {
            address = {
              apartment: e.placeDetails.address_components[0].long_name,
              address_line1: e.placeDetails.address_components[1].long_name,
              address_line2: e.placeDetails.address_components[2].long_name,
              city: e.placeDetails.address_components[3].long_name,
              state: e.placeDetails.address_components[5].long_name,
              country: e.placeDetails.address_components[6].long_name,
              zip_code: e.placeDetails.address_components[7].long_name,
            }
          } else {
            address = {
              apartment: "",
              address_line1: "",
              address_line2: "",
              city: "New York",
              state: "New York",
              country: "United States",
              zip_code: "",
            }
          }

          let params = {
            id: "",
            areaId: areaId,
            instruction: "",
            location: formatted_address,
            nickname: "Home",
            number: "",
            lat: location.lat,
            lng: location.lng,
            isDefault: true,
            address: address
          };
          navigation.replace(DeliveryAddressDetails, {
            params,
            edit: editAddress,
            id: addressId,
          });
        } else {
          toast.show(response.data.message, {
            type: "danger",
            placement: "bottom",
            duration: 4000,
          });
        }
      } catch (error) {
        console.log("error", error)
      }
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[ styles.container, { backgroundColor: Colors[colorScheme].background } ]}>
      <LocationView
        onLocationSelect={(e: any) => confirmLocation(e)}
        apiKey={GOOGLE_KEY}
        markerColor={getGlobalState('primaryColor')}
        myLocationBackground={"#FFF"}
        actionButtonStyle={{ backgroundColor: getGlobalState('primaryColor') }}
        actionText={"Confirm"}
        initialLocation={initRegion}
      ></LocationView>
      
      <View style={styles.backButton}>
        <TouchableOpacity style={styles.backCircle} onPress={() => { navigation.goBack() }}>
          <Ionicons name="arrow-back" size={27} color="black" />
        </TouchableOpacity>
      </View>

      {loading && (
        <View
          style={{
            position: "absolute",
            width: Layout.window.width,
            height: Layout.window.height,
            opacity: 0.1,
            backgroundColor: "#000",
            alignItems: "center",
            justifyContent: "center",
          }}
        ></View>
      )}

      {loading && (
        <ActivityIndicator
          style={{ position: "absolute", top: 0, bottom: 0, right: 0, left: 0 }}
          size="large"
          color={getGlobalState("primaryColor")}
        />
      )}
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
  },
  backButton: {
    position: "absolute",
    left: 10,
    top: Constants.statusBarHeight+5,
  },
  header: {
    position: "absolute",
    top: Constants.statusBarHeight + 10,
    right: 0,
    left: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: getGlobalState("primaryColor"),
  },
});
