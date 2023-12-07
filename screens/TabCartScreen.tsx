import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import { SwipeListView } from "react-native-swipe-list-view";
import { useToast } from "react-native-toast-notifications";
import Api from "../api/endpoints";
import Button from "../components/Button";
import { BevietBoldText, BevietText } from "../components/Text";
import Colors from "../constants/Colors";
import {
  ACCOUNT_GLOBAL_URL,
  STYLE_COLOR_FONT_ITEM_DATEAILS, STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY, STYLE_COLOR_PRIMARY
} from "../constants/GlobalConstants";
import useColorScheme from "../hooks/useColorScheme";
import { CheckOut } from "../navigation/Helpers";
import { RootTabScreenProps } from "../types";
import { getGlobalState, useGlobalState } from "../utils/Global";
import { STORAGE_CART, storeData } from "../utils/Helpers";
import SvgLoyalty from "../assets/images/loyalty.svg";
import SvgMinus from "../assets/images/minus.svg";
import SvgPlus from "../assets/images/plus.svg";

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;
const textColorItem = STYLE_COLOR_FONT_ITEM_DATEAILS;

var width = Dimensions.get("window").width; //full width
var height = Dimensions.get("window").height; //full height
interface IRegion {
  latitude: number;
  longitude: number;
}

export default function TabCartScreen({
  navigation,
}: RootTabScreenProps<"TabCart">) {
  const [delivery, setDelivery] = useState(true);
  const [region, setRegion] = useState<IRegion>({
    latitude: 42.813297,
    longitude: -73.941177,
  });
  const [address, setAddress] = useGlobalState<any>("address");

  const [deliveryFee, setDeliveryFee] = useGlobalState("deliveryFee");
  const [taxPercent, setTaxPercent] = useGlobalState("taxPercent");
  const [taxIncluded, setTaxIncluded] = useGlobalState("taxIncluded");
  const [outLetId, setOutLetId] = useGlobalState("outletId");
  const [carts, setCarts] = useGlobalState("cart");
  const toast = useToast();
  const [loyalty, setLoyalty] = useState(0);
  const [loadingLoyalty, setLoadingLoyalty] = useState(true);

  const [loading, setLoading] = useState<boolean>(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    getInitalData();
  }, []);

  const isFocused = useIsFocused();

  const getInitalData = async () => {
    setLoadingLoyalty(true);
    setDeliveryFee(address[0]?.deliveryData.deliveryFee);

    let response1: any = await Api.getOutletOrder();
    
    try {
      let data = response1.data.data;
      setTaxPercent(data.taxRate);
      setTaxIncluded(data.taxInclusive == "exclusive");
      setOutLetId(data.id);
    } catch (error) { }

    const accountResponse: any = await Api.getAccountByAccountName();
    
    try {
      if (accountResponse) {
        if (accountResponse.data.status == 1) {
          setLoyalty(accountResponse.data.data.loyalPercent);
          setLoadingLoyalty(false);
        }
      }
    } catch (error) {

    }
  };

  const getItems = (item: any) => {
    let items: any[] = [];
    item.menu.modifier_List.forEach((value: any) => {
      value.modifiers.forEach((element: any) => {
        if (element.checked == true) {
          const object = { 'name': element.name, 'quantity': element.quantity }
          items.push(object);
        }
      });
    });
    return items;
  }

  const getPrice = (item: any) => {
    const amount = item.amount;
    const menu = item.menu;
    let optionPrice = 0;
    menu.modifier_List.forEach((value: any) => {
      value.modifiers.forEach((element: any) => {
        if (element.checked == true) {
          optionPrice += element.price * element.quantity;
        }
      });
    });
    return amount * (menu.price + optionPrice);
  };

  const minusAmount = async (item: any, index: number) => {
    if (item.amount == 1) {
      deleteItem(index);
      return;
    }
    let temp: any = { ...carts };
    item.amount = item.amount - 1;
    temp.data[index] = item;
    await storeData(STORAGE_CART, JSON.stringify(temp));
    setCarts(temp);
  };

  const plusAmount = async (item: any, index: number) => {
    let temp: any = { ...carts };
    item.amount = item.amount + 1;
    temp.data[index] = item;
    await storeData(STORAGE_CART, JSON.stringify(temp));
    setCarts(temp);
  };

  const deleteItem = async (index: number) => {
    let temp: any = { ...carts };
    temp.data.splice(index, 1);
    await storeData(STORAGE_CART, JSON.stringify(temp));
    setCarts(temp);
  };

  const getSubTotal = () => {
    let subTotal = 0;
    carts.data.forEach((item: any) => {
      subTotal += getPrice(item);
    });
    return subTotal;
  };

  const getTax = () => {
    return (getSubTotal() * taxPercent) / 100;
  };

  const getShippingFee = () => {
    return deliveryFee;
  };

  const getTotal = () => {
    if (taxIncluded) {
      return getSubTotal() + getTax();
    } else {
      return getSubTotal();
    }
  };
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View style={styles.header}>
        <BevietBoldText style={{ fontSize: 20, color: '#020202', marginTop:10 }}>{carts.restaurant_name}</BevietBoldText>
      </View>

      <View style={{ flex: 1, marginTop: 15 }}>
        <BevietBoldText style={{ fontSize: 18, color: '#020202', paddingHorizontal: 15 }}>Items</BevietBoldText>
      
        {carts.data.length > 0 ? (
          <SwipeListView
            rightOpenValue={-75}
            rightActionValue={0}
            leftActionValue={0}
            swipeToOpenPercent={100}
            disableRightSwipe={true}
            data={carts.data}
            style={{ marginTop: 15 }}
            keyExtractor={(item: any, index: number) => item.menu.itemId + index}
            renderItem={(data: any, rowMap) => (
              // CART NEED TO BE FIXED
              <>
              <View style={{ flexDirection: "row", padding: 15, backgroundColor: "#fff", marginBottom: 15, }}>
                <View style={{ flex: 0.6 }}>
                 <BevietText style={{ fontSize: 16, fontWeight: '600', color: '#020202' }}>{data.item.amount}x</BevietText>
              </View>

              <View style={{ flex: 5 }}>
                <BevietText style={{ marginBottom: 5, fontSize: 16, fontWeight: '600', color: '#020202'}}>{data.item.menu.name}</BevietText>
                <View>
                  {
                    getItems(data.item).map((x, i) => <View key={i} style={{ display: 'flex', flexDirection: 'row' }}>
                      <BevietText style={{ fontSize: 14, color: '#020202' }}>{x.quantity > 1 ? x.quantity + 'x ' : ''}</BevietText>
                      <BevietText style={{ fontSize: 14, color: '#020202' }}>{x.name.trim()}</BevietText>
                    </View>)
                  }
                  <BevietText style={{ marginTop: 5, fontSize: 15, fontWeight: '600', color: '#020202' }}>${getPrice(data.item).toFixed(2)}</BevietText>
                  </View>
              </View>

              <View style={{ flex: 1.5, flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                <TouchableOpacity onPress={() => { minusAmount(data.item, data.index) }}>
                    <SvgMinus />
                </TouchableOpacity>

                <BevietText style={{ fontWeight: '600', fontSize: 16, color: primaryColor }}>{data.item.amount}</BevietText>
                    
                <TouchableOpacity onPress={() => { plusAmount(data.item, data.index) }}>
                  <SvgPlus />
                </TouchableOpacity>
              </View>

            </View>
            </>
            )}
            renderHiddenItem={(data: any, rowMap) => {
              return ( 
                <View style={{ backgroundColor: primaryColor,}}>
                  <TouchableOpacity onPress={() => deleteItem(data.index)} style={{ alignItems: "flex-end", justifyContent: "center", height: "80%", paddingRight: 10, paddingTop: 10, }}>
                    <FontAwesome name="trash" size={30} color={"#FFF"} />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
          ) 
          : 
          (
            <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
              <BevietBoldText style={{ fontSize: 18, textAlign: "center", color: '#020202' }}>
                You have no items on carts.
              </BevietBoldText>
            </View>
          )}
      </View>

      {/* Loyalty Text */}
      <View style={styles.loyaltyBox}>
        {loadingLoyalty
        ?
        <View style={{ alignItems: "center", justifyContent: "center"}}>
          <ActivityIndicator size={"small"} color={primaryColor} />
        </View>
        :
        <>
        <SvgLoyalty width={37} height={37}></SvgLoyalty>
        
        <View style={{ marginLeft: 20, paddingRight: 10, }}>
          <BevietText style={{ fontSize: 14 }}>You will earn ${(getTotal() * loyalty / 100).toFixed(2)} in loyalty cashback</BevietText>
          <BevietText style={{ fontSize: 14 }}>when you complete this order.</BevietText>
        </View>
        </>
        }
      </View>

      <View style={styles.bottom}>
        <View style={styles.rowVeiw}>
          <BevietText style={{ fontSize: 17, fontWeight: '400' }}>Subtotal</BevietText>
          <BevietText style={{ fontSize: 15, fontWeight: '400' }}>${getSubTotal().toFixed(2)}</BevietText>
        </View>
        {taxIncluded && (
          <View style={styles.rowVeiw}>
            <BevietText style={{ fontSize: 17, fontWeight: '400' }}>Tax ({taxPercent}%)</BevietText>
            <BevietText style={{ fontSize: 15, fontWeight: '400' }}>${getTax().toFixed(2)}</BevietText>
          </View>
        )}
        <View style={styles.rowVeiw}>
          <BevietText style={{ fontSize: 17, fontWeight: '400' }}>Total</BevietText>
          <BevietText style={{ fontSize: 15, fontWeight: '400' }}>${getTotal().toFixed(2)}</BevietText>
        </View>
        <Button
          label="Checkout"
          onPress={() => {
            if (carts.data.length == 0) {
              toast.show("You have no items on carts.", {
                type: "danger",
                placement: "top",
              });
            } else if (loading == false) {
              navigation.navigate(CheckOut);
            }
          }}
          containerStyle={{
            backgroundColor: primaryColor,
            borderRadius: 25,
            marginHorizontal: 10,
            marginTop: 10,
          }}
          loading={loading}
          textStyle={{ color: "#FFF", fontFamily: 'beviet-bold', fontSize: 25 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  loyaltyBox: {
    backgroundColor: '#E7EFEC', 
    justifyContent: 'center', 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderColor: '#144333', 
    borderRadius: 10, 
    padding: 10, 
    margin: 10,
  },

  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  bottom: {
    backgroundColor: "#FFF",
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  rowVeiw: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
});
