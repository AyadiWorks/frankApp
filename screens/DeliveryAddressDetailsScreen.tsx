import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import { useToast } from "react-native-toast-notifications";
import Api from "../api/endpoints";
import Button from "../components/Button";
import Colors from "../constants/Colors";
import {
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY,
  STYLE_COLOR_PRIMARY
} from "../constants/GlobalConstants";
import useColorScheme from "../hooks/useColorScheme";
import { RootStackScreenProps } from "../types";
import { useGlobalState } from "../utils/Global";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from 'react-native-maps';
import { ScrollView } from "react-native-gesture-handler";

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;

export default function DeliveryAddressDetailsScreen({
  navigation,
  route,
}: RootStackScreenProps<"MapView">) {

  const params = route.params?.params;
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const colorScheme = useColorScheme();
  const [locationInformations, setLocationInformations] = useState(params);
  const [deliveryAddress, setDeliveryAddress] = useGlobalState("deliveryAddress");
  const [deliveryAddressList, setDeliveryAddressList] = useGlobalState("deliveryAddressList");
  const editAddress = route.params?.edit;
  const addressId = route.params?.id;
  
  const getLocationText = (address: string, start: number, end: number) => {
    let list = address.split(",");
    let text = "";
    if (end == -1) {
      end = list.length - 1;
    }
    for (let index = start; index <= end; index++) {
      text += list[index];
    }
    return text.trim();
  };

  const saveAddress = async () => {
    if (!loading) {
      setLoading(true);
      if (editAddress) {
        let param = {
          id: addressId,
        };
        await Api.deleteDeliveryAddress(param);
      }
      let response: any = await Api.createDeliveryAddress(locationInformations);
      try {
        if (response.data.status) {
          let id = response.data.data;
          try {
            let response: any = await Api.listAddressDelivery();
            if (response.data.status == 1) {
              setDeliveryAddressList(response.data.data);
              response.data.data.forEach((element: any) => {
                if (element.id == id) {
                  setDeliveryAddress(element);
                }
              });
            }
          } catch (error) {}
          navigation.goBack();
        } else {
          toast.show(response.data.message, {
            type: "danger",
            placement: "bottom",
            duration: 4000,
          });
        }
      } catch (error) {}
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if(locationInformations) {
  //     console.log("YOOOW", locationInformations);
  //     console.log("LAT", locationInformations.lat);
  //     console.log("LONG", locationInformations.lng);
  //   }
  // }, [locationInformations]);

  return (
    <SafeAreaView style={[ styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      
      <TouchableOpacity style={{ paddingLeft: 20 }} onPress={() => { !loading ? navigation.goBack() : null }}>
        <Ionicons name="arrow-back" size={27} color="black" />
      </TouchableOpacity>
      
      <Text style={styles.title}>Set Address Details</Text>
      
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      
        <View style={{ flex: 6 }}>
          <ScrollView>

            <View style={styles.mapContainer}>
              <MapView 
                style={styles.map} 
                provider={"google"}
                initialRegion={{
                  latitude: locationInformations.lat,
                  longitude: locationInformations.lng,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.0121,
                }}
                scrollEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: locationInformations.lat,
                    longitude: locationInformations.lng,
                  }}
                  title={locationInformations.location}
                  description={""}
                  image={require("../assets/images/map-pin.png")}
              />
            </MapView>
            
            </View>

            <View style={{ paddingHorizontal: 20 }}>
              {/* Adress */}
              <View style={{ marginTop: 20 }}>
                <Text numberOfLines={2}style={[styles.boldTxt, { marginBottom: 8 }]}>
                  {getLocationText(locationInformations.location, 0, 0)}
                </Text>

                <Text numberOfLines={2} style={styles.tinyTxt}>
                  {getLocationText(locationInformations.location, 1, -1)}
                </Text>
              </View>
              
              {/* APT/SUITE */}
              <View style={styles.detaillsRow}>
                <Text style={[styles.boldTxt, { fontSize: 16, marginRight: 20, }]}>Apt/Suite</Text>

                <TextInput
                  placeholder="Apt 2809"
                  style={styles.txtInput}
                  onChangeText={(apt: string) => { setLocationInformations({ ...locationInformations, number: apt }) }}
                  value={locationInformations.number}
                />
              </View>

              {/* DELIVERY INSTRUCS */}
              <View>
                <Text style={[styles.boldTxt, { fontSize: 16, marginBottom: 5, }]}>Delivery Instructions:</Text>

                <TextInput
                multiline
                numberOfLines={4}
                onChangeText={(text) =>
                  setLocationInformations({ ...locationInformations, instruction: text, })}
                value={locationInformations.instruction}
                placeholder="e.g. ring doorbell, leave in front of the main door, Call when here ..."
                style={styles.instrucInput}
              />
              </View>
            </View>

          </ScrollView>
        </View>
        
        {/* Save Btn */}
        <View style={{ flex: 1, justifyContent: "center", }}>
          <Button
            label="Save Address"
            onPress={() => { saveAddress() }}
            containerStyle={styles.saveBtn}
            loading={loading}
            textStyle={{ color: "#FFF", fontFamily: "beviet-bold" }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  saveBtn: {
    borderRadius: 30,
    backgroundColor: primaryColor,
    marginHorizontal: 30,
    // marginBottom: 25,
  },

  instrucInput: {
    fontSize: 13,
  },

  txtInput: {
      fontSize: 14,
      padding: 4,
      flex: 1,
      textAlignVertical: "top",
  },

  detaillsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    // backgroundColor: "red",
  },

  tinyTxt: {
    fontSize: 12,
    color: textColorPrimary,
    fontFamily: "beviet-regular",
    // marginBottom: 5,
  },

  boldTxt: {
    fontSize: 18,
    color: textColorPrimary,
    fontFamily: "beviet-bold",
  },

  map: {
    width: "100%",
    height: "100%",

  },
  
  mapContainer: {
    height: 180,
    width: "100%",
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },


  container: {
    flex: 1,
    // paddingTop: Constants.statusBarHeight,
  },
  backButton: {
    position: "absolute",
    left: 10,
    top: Constants.statusBarHeight + 10,
    zIndex: 9999,
  },
  header: {
    marginTop: 10,
    zIndex: 9998,
  },
  title: {
    fontSize: 22,
    color: "#000",
    fontFamily: "beviet-bold",
    paddingLeft: 20,
  },
});
