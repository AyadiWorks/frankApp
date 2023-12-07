import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useToast } from "react-native-toast-notifications";
import Api from "../api/endpoints";
import {
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY,
  STYLE_COLOR_PRIMARY,
  STYLE_COLOR_SECONDARY,
} from "../constants/GlobalConstants";
// import SVGDelete from "../assets/images/delete.svg";
// import SVGAddress from "../assets/images/ic_address.svg";
// import SVGCheck from "../assets/images/ic_check.svg";
// import SVGEdit from "../assets/images/ic_edit.svg";
import { useGlobalState } from "../utils/Global";
import Button from "./Button";

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;
const secondaryColor = STYLE_COLOR_SECONDARY;

export default function BottomSheetView({
  onNewAddress,
  onSelectAddress,
  onEditAddress,
  isAddress,
}: {
  onNewAddress: () => void;
  onSelectAddress: () => void;
  onEditAddress: (item: any) => void;
  isAddress: (item: any) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [addressList, setAddressList] = useGlobalState("deliveryAddressList");
  const toast = useToast();
  const [deliveryAddress, setDeliveryAddress] =
    useGlobalState("deliveryAddress");

  // console.log("ADDRESS LIST: ", addressList);
  // console.log("ADDRESS LIST LENGTH: ", addressList.length);

  useEffect(() => {
    getListAddress();
  }, []);

  const getListAddress = async () => {
    try {
      let response: any = await Api.listAddressDelivery();
      if (response.data.status == 1) {
        setAddressList(response.data.data);
        isAddress(response.data.data.length);
      }
    } catch (error) {}
  };

  const checkSelected = (address: any) => {
    if (deliveryAddress) {
      if (address.id == deliveryAddress.id) {
        return true;
      }
    }
    return false;
  };

  const deleteAddress = async (address: any) => {
    let param = {
      id: address.id,
    };
    setLoading(true);
    let response: any = await Api.deleteDeliveryAddress(param);
    try {
      if (response.data.status == 0) {
        toast.show(response.data.message, {
          type: "danger",
          placement: "bottom",
          duration: 4000,
        });
      }
    } catch (error) {}
    getListAddress();
    setLoading(false);
  };

  const selectedItem = (address: any) => {
    setDeliveryAddress(address);
    onSelectAddress();
  };

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

  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 20,
          textAlign: "center",
          color: primaryColor,
          fontWeight: "bold",
        }}
      >
        Select Address
      </Text>
      <BottomSheetScrollView>
        <View style={{ marginTop: 10 }}>
          {addressList.length > 0 ? (
            addressList.map((item, index) => {
              return (
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginVertical: 5,
                    padding: 10,
                    backgroundColor: "#f3f3f3",
                    marginHorizontal: 15,
                    borderRadius: 20,
                  }}
                  key={`${index}_address`}
                >
                  <TouchableOpacity
                    onPress={() => selectedItem(item)}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="map-marker-multiple"
                      size={26}
                      color={secondaryColor}
                    />
                    {/* <SVGAddress width={24} height={24} fill={primaryColor} /> */}
                    <View style={{ marginLeft: 20 }}>
                      <Text
                        numberOfLines={2}
                        style={{
                          fontSize: 14,
                          color: textColorPrimary,
                        }}
                      >
                        {getLocationText(item.location, 0, 0)}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={{
                          fontSize: 14,
                          color: textColorPrimary,
                        }}
                      >
                        {getLocationText(item.location, 1, -1)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <View>
                    {checkSelected(item) ? (
                      <View style={{ padding: 5 }}>
                        <MaterialCommunityIcons
                          name="check"
                          size={20}
                          color={primaryColor}
                        />
                      </View>
                    ) : (
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {/* <TouchableOpacity
                          onPress={() => {
                            if (!loading) onEditAddress(item);
                          }}
                          style={{ padding: 5 }}
                        >
                          <MaterialCommunityIcons
                            name="file-edit-outline"
                            size={26}
                            color="gray"
                          />
                        </TouchableOpacity> */}

                        <TouchableOpacity
                          onPress={() => {
                            if (!loading) deleteAddress(item);
                          }}
                          style={{ padding: 5 }}
                        >
                          <MaterialCommunityIcons
                            name="close-circle"
                            size={26}
                            color="gray"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <Text
              style={{
                fontSize: 15,
                color: textColorPrimary,
                textAlign: "center",
                marginTop: 20,
              }}
            >
              No saved address
            </Text>
          )}
        </View>
      </BottomSheetScrollView>
      <View>
        <Button
          label="Add New Address"
          onPress={() => {
            if (!loading) onNewAddress();
          }}
          loading={loading}
          containerStyle={{
            borderRadius: 10,
            backgroundColor: primaryColor,
            marginBottom: 20,
            marginHorizontal: 10,
          }}
          textStyle={{ color: "#FFF", fontWeight: "bold" }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
