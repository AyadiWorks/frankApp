import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Dimensions,
  Image, ScrollView, StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable
} from "react-native";

import { RadioButton } from "react-native-paper";
import SafeAreaView from "react-native-safe-area-view";
import Button from "../components/Button";
import { useToast } from "react-native-toast-notifications";

import { Entypo, FontAwesome, AntDesign } from "@expo/vector-icons";
import Constants from "expo-constants";

import Api from "../api/endpoints";
import Colors from "../constants/Colors";

import {
  IMGIX_URL, STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY, STYLE_COLOR_PRIMARY
} from "../constants/GlobalConstants";

import useColorScheme from "../hooks/useColorScheme";

import { RootStackScreenProps } from "../types";
import { getGlobalState, useGlobalState } from "../utils/Global";
import { STORAGE_CART, storeData } from "../utils/Helpers";

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;

var width = Dimensions.get("window").width; //full width
var height = Dimensions.get("window").height; //full height

export default function MenuScreen({ navigation, route,}: RootStackScreenProps<"Menu">) {
  
  const itemId = route.params?.itemId;
  
  const [carts, setCarts] = useGlobalState<any>("cart");
  const [loading, setLoading] = useState<boolean>(true);
  const colorScheme = useColorScheme();
  const [menu, setMenu] = useState<any>({});
  const [amount, setAmount] = useState(1);
  const [elementRects, setElementRects] = useState<any[]>([]);
  const toast = useToast();
  const scrollRef = useRef<ScrollView>(null);
  const [address, setAddress] = useGlobalState<any>("address");





  const setMultiCheck = (option: any, option_index: number, index: number) => {
    let temp = menu;
    if (option.checked == true) {
      // option.checked = false;
      option.quantity = option.quantity + 1;
    } else {
      option.checked = true;
      option.quantity = 1;
    }
    temp.modifier_List[index].modifiers[option_index] = option;
    setMenu({ ...temp });
  };

  const deleteMulti = (option: any, option_index: number, index: number) => {
    let temp = menu;
    option.checked = false;
    option.quantity = 0;
    temp.modifier_List[index].modifiers[option_index] = option;
    setMenu({ ...temp });
  };

  const setSingleCheck = (option: any, option_index: number, index: number) => {
    let temp = menu;
    let section = temp.modifier_List[index];
    let options = section.modifiers;
    for (let i = 0; i < options.length; i++) {
      let item = options[i];
      item.checked = false;
      item.quantity = 0;
      if (i == option_index) {
        item.checked = true;
        item.quantity = 1;
      }
    }
    setMenu({ ...temp });
  };

  const checkValidate = () => {
    let validate = true;
    let refIndex = 0;
    menu.modifier_List.forEach((value: any, index: number) => {
      let minSelect = value.minSelect;
      let maxSelect = value.maxSelect;
      let checked = 0;
      value.modifiers.forEach((element: any) => {
        if (element.checked == true) {
          checked++;
        }
      });
      if (checked < minSelect || checked > maxSelect) {
        if (validate) refIndex = index;
        validate = false;
        return;
      }
    });
    if (!validate) {
      let rect = elementRects[refIndex];
      let height = 0;
      for (let index = 0; index <= refIndex; index++) {
        let before = elementRects[index];
        height += before.height;
      }
      scrollRef.current?.scrollTo({
        x: 0,
        y: height,
        animated: true,
      });
    }
    return validate;
  };

  const checkCart = async () => {
    if (carts.account_url != "" && carts.account_url != getGlobalState('account_url')) {
      Alert.alert('Clear old cart and proceed?', "There are already some items from another restaurant. You can't add items from multiple restaurants.", [
        {
          text: 'Cancel', onPress: () => {
          }
        },
        {
          text: 'Proceed', onPress: async () => {
            addCart(true);
          }
        },
      ])
    } else {
      addCart(false);
    }
  }

  const addCart = async (empty: boolean) => {
    let validate = checkValidate();
    if (!validate) {
      toast.show("Please select valid options", {
        type: "danger",
        placement: "top",
      });
      return;
    }
    let temp = { ...carts };
    if (empty) {
      temp.account_url = "";
      temp.branche_url = "";
      temp.restaurant_name = "";
      temp.data = [];
    }
    temp.account_url = getGlobalState('account_url');
    temp.branche_url = getGlobalState('branche_url');
    temp.restaurant_name = address[0].outletName
    let item = {
      menu: menu,
      amount: amount,
    };
    temp.data.push(item);
    await storeData(STORAGE_CART, JSON.stringify(temp));
    setCarts(temp);
    navigation.goBack();
  };

  const getMenu = async () => {
    setLoading(true);
    let params = {
      itemId: itemId,
    };
    let response: any = await Api.getOneItemWithModifier(params);
    try {
      // console.log("TST",response.data.data);
      setMenu(response.data.data);
      setLoading(false);
    } catch (error) { }
  };

  // Life Cycle 
  useEffect(() => {
    getMenu();
  }, []);

  return (
    <SafeAreaView style={styles.container}
      // style={[styles.container,
      //   // { backgroundColor: Colors[colorScheme].background },
      // ]}
    >
      {loading 
      ?
      (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
      ) 
      : 
      (
      <View style={{ flex: 1, width: "100%" }}>
        <View style={styles.backButton}>
          {/* <TouchableOpacity onPress={() => { !loading ? navigation.goBack() : null}}>
            <FontAwesome name="chevron-circle-left" size={36} color="#aaa" />
          </TouchableOpacity> */}
          <Pressable style={styles.backBtnContainer} onPress={() => !loading ? navigation.goBack() : null}>
            <AntDesign name="arrowleft" size={30} color="#000" />
          </Pressable>
        </View>
        <ScrollView ref={scrollRef}>
          <Image
            source={
              menu.url
              ?
              { uri: `${IMGIX_URL}/${menu.url}?ixlib=vue-2.8.4&auto=format&w=1678` }
              :
              require("../assets/images/default-restau.jpeg")
            }
            resizeMode="cover"
            style={styles.image}
          />
          <View style={{ marginHorizontal: 5 }}>
            <View style={styles.menuTextBox}>
              <Text style={styles.menuName}>{menu.name}</Text>
              <Text style={styles.menuDescription}>{menu.description}</Text>
            </View>
          </View>
          <View style={{ paddingVertical: 20 }}>
            {menu.modifier_List?.map((item: any, index: number) => {
              return (
                <View
                  key={`${item.id}_${index}`}
                  onLayout={(event: any) => {
                    let temp: any[] = elementRects;
                    var layout = event.nativeEvent.layout;
                    temp.push(layout);
                    setElementRects(temp);
                  }}
                >
                  <View
                    style={{ height: 15, backgroundColor: "#F5F5F8" }}
                  ></View>
                  <View style={{ padding: 15 }}>
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View>
                        <Text style={styles.sectionHeader}>
                          {item.displayName}
                        </Text>
                        {item.type == "Multiple" && (
                          <Text style={styles.chooseUp}>
                            Choose up to {item.maxSelect}
                          </Text>
                        )}
                      </View>
                      {item.minSelect > 0 && (
                        <View>
                          <Text
                            style={{
                              borderWidth: 1,
                              borderColor: primaryColor,
                              color: primaryColor,
                              paddingHorizontal: 10,
                              paddingVertical: 2,
                              borderRadius: 8,
                            }}
                          >
                            Required
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {item.modifiers.map((option: any, option_index: number) => {
                    return (
                      <View
                        style={{ paddingHorizontal: 15 }}
                        key={`${option_index}_${option.name}`}
                      >
                        {item.type == "Multiple" ? (
                          <TouchableOpacity
                            style={{ paddingVertical: 3 }}
                            onPress={() => {
                              setMultiCheck(option, option_index, index);
                            }}
                          >
                            <View
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              {option.checked && (
                                <Text
                                  style={{
                                    color: primaryColor,
                                    fontSize: 16,
                                    marginRight: 5,
                                    marginBottom: 12,
                                  }}
                                >
                                  {option.quantity}x
                                </Text>
                              )}
                              <Text style={styles.optionName}>
                                {option.name.trim()}
                              </Text>
                              {option.price > 0 && (
                                <Text style={styles.optionPrice}>
                                  ${option.price.toFixed(2)}
                                </Text>
                              )}
                              {option.checked && (
                                <TouchableOpacity
                                  style={{ marginLeft: 5 }}
                                  onPress={() => {
                                    deleteMulti(option, option_index, index);
                                  }}
                                >
                                  <Entypo
                                    name="circle-with-cross"
                                    size={22}
                                    color="black"
                                    style={{ marginBottom: 12 }}
                                  />
                                </TouchableOpacity>
                              )}
                            </View>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onPress={() => {
                              setSingleCheck(option, option_index, index);
                            }}
                            style={{ paddingVertical: 3 }}
                          >
                            <View
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <RadioButton
                                onPress={() => {
                                  setSingleCheck(option, option_index, index);
                                }}
                                value={option.checked}
                                color={
                                  option.checked == true
                                    ? primaryColor
                                    : textColorPrimary
                                }
                                status={
                                  option.checked == true
                                    ? "checked"
                                    : "unchecked"
                                }
                              />

                              <Text style={styles.optionNameSingle}>
                                {option.name.trim()}
                              </Text>
                              {option.price > 0 && (
                                <Text style={styles.optionPriceSingle}>
                                  ${option.price.toFixed(2)}
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>
        <View style={{ height: 15, backgroundColor: "#F5F5F8" }}></View>
        <View style={styles.bottom}>
          <View style={styles.amountControlBox}>
            <TouchableOpacity
              style={styles.minus}
              onPress={() => {
                if (amount > 1) setAmount(amount - 1);
              }}
            >
              <FontAwesome name="minus" size={20} color={primaryColor} />
            </TouchableOpacity>
            <Text style={styles.amount}>{amount}</Text>
            <TouchableOpacity
              style={styles.plus}
              onPress={() => setAmount(amount + 1)}
            >
              <FontAwesome name="plus" size={20} color={primaryColor} />
            </TouchableOpacity>
          </View>
          <View style={styles.cartButtonBox}>
            <Button
              label={"Add to cart"}
              onPress={() => {
                if (!loading) checkCart();
              }}
              containerStyle={{
                width: "100%",
                paddingVertical: 15,
                borderRadius: 30,
                backgroundColor: primaryColor,
              }}
              loading={loading}
              textStyle={{ color: "#FFF", flex: 1, fontWeight: "bold" }}
            />
          </View>
        </View>
      </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  backBtnContainer: {
    backgroundColor: "white",
    borderRadius: 99,
    padding: 6,
    // marginTop: 65,
    // marginLeft: 20,
  },

  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: Constants.statusBarHeight,
  },

  backButton: {
    position: "absolute",
    left: 15,
    top: Constants.statusBarHeight - 10,
    zIndex: 9999,
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
  image: {
    width: "100%",
    height: 250,
  },
  menuTextBox: {
    marginTop: 14,
    paddingHorizontal: 10,
  },
  menuName: {
    fontSize: 20,
    color: textColorPrimary,
    fontWeight: "bold",
  },
  menuDescription: {
    fontSize: 14,
    color: textColorPrimary,
    marginTop: 5,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "bold",
  },
  chooseUp: {
    fontSize: 14,
    color: "#B4B4B4",
  },
  optionName: {
    fontSize: 14,
    flex: 1,
    color: textColorPrimary,
    marginBottom: 12,
    marginLeft: 10,
  },

  optionNameSingle: {
    fontSize: 14,
    flex: 1,
    color: textColorPrimary,

    marginLeft: 10,
  },

  optionPrice: {
    fontSize: 14,
    color: textColorPrimary,
    marginBottom: 12,
  },

  optionPriceSingle: {
    fontSize: 14,
    color: textColorPrimary,
  },

  bottom: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  amountControlBox: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#F5F5F8",
    flex: 1,
    borderRadius: 8,
  },
  amount: {
    fontSize: 16,
    color: textColorPrimary,
  },
  cartButtonBox: {
    flex: 2,
    marginLeft: 10,
  },
  minus: {
    padding: 15,
  },
  plus: {
    padding: 15,
  },
});
