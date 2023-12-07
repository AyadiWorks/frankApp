import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView
} from "@gorhom/bottom-sheet";
import {
  ApplePayButton,
  CardForm,
  useApplePay,
  useConfirmPayment,
  useStripe,
} from "@stripe/stripe-react-native";
import { create } from "apisauce";
// import { BarCodeScanner } from 'expo-barcode-scanner';
import Constants from "expo-constants";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Image, Pressable, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SafeAreaView from "react-native-safe-area-view";
import { useToast } from "react-native-toast-notifications";
import Api from '../api/endpoints';
import Button from "../components/Button";
import { ACCOUNT_GLOBAL_URL, STYLE_COLOR_FONT_PRIMARY, STYLE_COLOR_FONT_SECONDARY, STYLE_COLOR_PRIMARY } from '../constants/GlobalConstants';
import Layout from '../constants/Layout';
import useColorScheme from "../hooks/useColorScheme";
import { RootStackScreenProps } from "../types";
import Colors from "../constants/Colors";
import { BevietBoldText, BevietText } from "../components/Text";
import SvgLoyalty from "../assets/images/loyalty.svg";

import { STORAGE_USER, getData } from "../utils/Helpers";

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;

const POS_URL = "https://api.kattooz.com/pos/orders/by-SID/"
// Test
// const POS_URL = "https://staging.api-pos.kattooz.com/pos/orders/by-SID";

const posClient = create({
  baseURL: POS_URL,
});

export default function PosOrderScreen({ navigation, route }: RootStackScreenProps<"PosOrder">) {

  // State:
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const colorScheme = useColorScheme();
  const [scanned, setScanned] = useState(false);
  const [type, setType] = useState("");
  const id = route.params?.id;
  const [tip, setTip] = useState(20);
  const [tipPercent, setTipPercent] = useState(20);
  const [tipCustomTemp, setTipCustomTemp] = useState("");
  const order = route.params?.order;
  const [tipModal, setTipModal] = useState(false);
  const [fixTransaction, setFixTransaction] = useState(1);
  const [transactionPercentage, setTransactionPecentage] = useState(1);

  const PaymentSheetRef = useRef<BottomSheet>(null);
  const snapPointsPayment = useMemo(() => [600], []);
  const handleSheetChanges = useCallback((index: number) => { }, []);
  
  const TaxesSheetRef = useRef<BottomSheet>(null);
  const snapPointsTaxes = useMemo(() => [250], []);
  const handleTaxesSheetChanges = useCallback((index: number) => { }, []);
  
  const { confirmPayment } = useConfirmPayment();
  const { presentApplePay, confirmApplePayPayment, isApplePaySupported } = useApplePay();
  const [loyalty, setLoyalty] = useState(0);

  // Stripe
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);



  const getLoyaltyAndGlobalFees = async () => {
    // let params = {
    //   account_name: ACCOUNT_GLOBAL_URL
    // }
    const accountResponse: any = await Api.getAccountByAccountName();
    try {
      if (accountResponse) {
        if (accountResponse.data.status == 1) {
          // console.log("Loyalty & global fees", accountResponse.data.data);
          setLoyalty(accountResponse.data.data.loyalPercent);
        }
      }
    } catch (error) {}

    let response: any = await Api.getRestaurantFees();
    // console.log("resp", response.data.data);
    // console.log("resp", response.data.data.fixTransactionFee, response.data.data.percentTransactionFee);
    try {
      if (response.data.data) {
        setFixTransaction(response.data.data.fixTransactionFee);
        setTransactionPecentage(response.data.data.percentTransactionFee);
      }
    } catch (error) {}
  };
  
  const getTax = (tax: number) => {
    return (tax / 100).toFixed(2);
  };

  const getFees = (total: number) => {
    return ( (total / 100) * (transactionPercentage / 100) + fixTransaction ).toFixed(2);
  };

  const getTaxAndFees = (tax: number, total: number) => {
    return parseFloat(getTax(tax) + getFees(total)).toFixed(2)
  };

  const payOrder = (id: string, data: any) => posClient.patch(id, data);

  const isActiveTip = (tipP: number) => {
    if(tipP === tipPercent) {
      return true;
    } else {
      return false;
    }
  };

  const isActive = (percent: number) => {
    if (percent == 0) {
      if (tip != order?.subtotal / 100 / 100 * 10 && tip != order?.subtotal / 100 / 100 * 20 && tip != order?.subtotal / 100 / 100 * 25) {
        return true;
      } else {
        return false
      }
    }

    if (tip == order?.subtotal / 100 / 100 * percent) {
      return true
    } else {
      return false
    }
  };

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  const renderTaxesBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  const pay2Stripe = async () => {
    // Test:
    // navigation.navigate("PayOrderSucess");
    
    const info = {
      currency: "USD",
      price: order?.total / 100 + tip,
      type: "card",
      // restaurant_name: order?.restaurantName,
      restaurant_name: "frank-global"
    };
    setLoading(true)
    let response: any = await Api.createPaymentIntent(info);
    if (response.data.status == 0) {
      toast.show("Create payment intent failed.", {
        type: "danger",
        placement: "top",
      });
      setLoading(false);
      return;
    }
    let intent: string = response.data.data;
    try {
      const { error, paymentIntent } = await confirmPayment(intent, {
        type: "Card",
      });
      if (error) {
        toast.show("Payment confirmation error", {
          type: "danger",
          placement: "top",
        });
        setLoading(false);
      } else if (paymentIntent) {
        checkout("stripe", paymentIntent.id)
      }
    } catch (error) {
      console.log("error : ", error);
      setLoading(false);
    }
  };

  const applePay = async () => {
    setLoading(true)
    if (!isApplePaySupported) {
      toast.show("Apple pay is not supported", {
        type: "danger",
        placement: "top",
      });
      return;
    }
    let totalToPay = (order?.total / 100 + tip).toFixed(2);

    const { error } = await presentApplePay({
      cartItems: [{ label: "RealFrank", amount: totalToPay }],
      country: "US",
      currency: "USD",
      jcbEnabled: true,
    });
    if (error) {
      toast.show("Payment processing failed", {
        type: "danger",
        placement: "top",
      });
      setLoading(false)
    } else {
      const info = {
        currency: "USD",
        price: totalToPay,
        type: "card",
        // restaurant_name: order?.restaurantName,
        restaurant_name: "frank-global"
      };
      let response: any = await Api.createPaymentIntent(info);

      try {
        if (response.data.status) {
          const { error: confirmError } = await confirmApplePayPayment(
            response.data.data
          );
          if (confirmError) {
            toast.show("Payment confirmation error", {
              type: "danger",
              placement: "top",
            });
            setLoading(false);
          } else {
            checkout("Apple-pay", "");
          }
        }
      } catch (error) { }
    }
  };

  const checkout = async (type: string, intentId: any) => {
    let userResponse: any = (await Api.getUserInfo()).data;
    const data = {
      tip: tip * 100,
      total: parseFloat((order?.total / 100 + tip).toFixed(2)) * 100,
      payment: {
        method: type,
        amount: parseFloat((order?.total / 100 + tip).toFixed(2)) * 100,
        intentId: intentId,
        userID: userResponse.data.userId,
      },
    };
    let response: any = await payOrder(id, data);
    if (response.data.type == "success") {
      let userResponse: any = (await Api.getUserInfo()).data;
      let body = {
        account_url: userResponse.data.userId,
        point_amount_to_add: ((order?.total / 100 + tip) * loyalty/100).toFixed(2)
      }
      // console.log(body)
      let r = await Api.addLoyaltyBalance(body)
      // console.log(r.data)
      // PaymentSheetRef.current?.close();
      // navigation.goBack();
      setCheckoutLoading(false);
      navigation.navigate("PayOrderSucess");
    }
    setLoading(false);
  };

  // Stripe
  const checkValidate = async () => {
    // Init Payment Sheet
    let intent: any = await initialisePaymentSheet();

    if(intent) {
      openStripePaymentSheet(intent);
    } else {
      Alert.alert("Frank cares", "Init Stripe failed, Please try again");
    };
  };

  const openStripePaymentSheet = async (intent: any) => {
    if (!intent) {
      return;
    };
    
    const { error } = await presentPaymentSheet({ intent });

    if (error) {
      Alert.alert(`Frank cares`, error.message);
      setCheckoutLoading(false);
      return;
    } else {
      checkout("stripe", intent);
    }
  };

  const fetchPaymentIntent = async () => {

    const info = {
      currency: "USD",
      price: order?.total / 100 + tip,
      type: "card",
      restaurant_name: "frank-global",
    };

    // let response: any = await Api.createPaymentIntent(info);
    let response: any = await Api.getStripePaymentIntent(info);

    if (response.data.status == 0) {
      toast.show("Create payment intent failed.", {
        type: "danger",
        placement: "top",
      });
      return;
    };

    let paymentIntent: string = response.data.data;
    return paymentIntent;
  };

  const fetchEphemeralkey = async () => {
    let user_data = await getData(STORAGE_USER);
    
    let response: any = await Api.getStripeEphemeralKey(user_data.stripeCustomerId);
    
    let responseToJson = JSON.parse(response.data.data);

    // The ephemeral KEY:
    return responseToJson.secret;
  };

  const fetchPaymentSheetParams = async () => {
    
    const paymentIntent = await fetchPaymentIntent();
    const ephemeralKey = await fetchEphemeralkey();

    return {
      paymentIntent,
      ephemeralKey,
    };
  };

  const initialisePaymentSheet = async () => {
    setCheckoutLoading(true);
    let user_data = await getData(STORAGE_USER);

    const { paymentIntent, ephemeralKey } = await fetchPaymentSheetParams();

    const { error } = await initPaymentSheet({
      customerId: user_data.stripeCustomerId,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      customFlow: false,
      merchantDisplayName: "Frank Cares",
      style: 'automatic',
    });
    
    if (!error) {
      return paymentIntent;
    }
    return false;
  };

  useEffect(() => {
    getLoyaltyAndGlobalFees();
  }, []);

  // useEffect(() => {
  //   console.log("I have order here", order);
  // }, [order]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      
      <View style={styles.backButton}>
        <TouchableOpacity onPress={() => {!loading ? navigation.goBack() : null}}>
          <AntDesign name="arrowleft" size={30} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 15, marginTop: Constants.statusBarHeight + 20, marginBottom: 10, }}>
        <BevietBoldText style={{ fontSize: 30 }}>Order Details</BevietBoldText>
        <BevietText style={{ fontSize: 20, marginTop: 10, color: "#144333", marginVertical: 10, }}>{order.restaurantName} Restaurant</BevietText>
      </View>
      
      <View style={{ height: 5, backgroundColor: "rgba(0,0,0,0.08)" }}></View>
      
      <ScrollView contentContainerStyle={{ flex: 1 }}>
        
        {order?.items.map((item: any, index: any) => (
          <View key={(index * Math.random()).toString()} style={styles.orderItem}>
            <BevietBoldText style={{ fontSize: 14, marginRight: 20 }}>{item.quantity} x</BevietBoldText>
            <View style={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ display: 'flex', flexDirection: 'column' }}>
                <BevietText style={{ fontSize: 14 }}>{item.name}</BevietText>
                {
                  item.specialInstructions.map((item: any) => {
                    return item.subtitles.map((sub: any, index: any) => {
                      return <BevietText style={{ fontSize: 14 }} key={index}>{sub.quantity} {sub.title} (${sub.price.toFixed(2)})</BevietText>
                    })
                  })
                }
              </View>
              <BevietText style={{ fontSize: 14 }}>$ {item.price / 100}</BevietText>
            </View>
          </View>
        ))}

        <View style={{ height: 5, backgroundColor: "rgba(0,0,0,0.08)" }}></View>
        
        <View style={{ paddingHorizontal: 10 }}>
          
          <View style={{ padding: 10, backgroundColor: '#FFF', borderRadius: 5, marginTop: 10 }}>
            
            {/* Loyalty Box */}
            <View style={styles.loyaltyBox}>
              <SvgLoyalty width={40} height={40}></SvgLoyalty>
              <View style={{ marginLeft: 15 }}>
                <BevietBoldText style={{ fontSize: 14 }}>You will earn ${((order?.total / 100 + tip) * (loyalty / 100)).toFixed(2)} in loyalty cashback</BevietBoldText>
                <BevietBoldText style={{ fontSize: 14 }}>when you complete this order.</BevietBoldText>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: "space-between", marginVertical: 10,}}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image source={require("../assets/images/charity.png")} style={{ height: 20, width: 20, resizeMode: "contain", marginRight: 10, }} />
              <BevietText style={{ fontSize: 14, marginRight: 20 }}>Staff Tip</BevietText>
              </View>
              <BevietBoldText style={{ fontSize: 16 }}>$ {tip.toFixed(2)}</BevietBoldText>
            </View>

            <View style={styles.tipsRow}>
              <TouchableOpacity style={isActiveTip(10) ? styles.activeTip : styles.deactiveTip}
                onPress={() => {
                  setTipPercent(10);
                  setTip((order?.subtotal / 100 / 100 * 10));
                }}
              >
                <BevietBoldText style={isActiveTip(10) ? styles.activeTipText : styles.deactiveTipText}>10%</BevietBoldText>
              </TouchableOpacity>

              <TouchableOpacity style={isActiveTip(15) ? styles.activeTip : styles.deactiveTip}
                onPress={() => {
                  setTipPercent(15);
                  setTip(order?.subtotal / 100 / 100 * 15);
                }}>
                <BevietBoldText style={isActiveTip(15) ? styles.activeTipText : styles.deactiveTipText}>15%</BevietBoldText>
              </TouchableOpacity>

              <TouchableOpacity style={isActiveTip(20) ? styles.activeTip : styles.deactiveTip}
                onPress={() => {
                  setTipPercent(20);
                  setTip(order?.subtotal / 100 / 100 * 20)
                }}>
                <BevietBoldText style={isActiveTip(20) ? styles.activeTipText : styles.deactiveTipText}>20%</BevietBoldText>
              </TouchableOpacity>

              <TouchableOpacity style={isActiveTip(0) ? styles.activeTip : styles.deactiveTip}
                onPress={() => {
                  setTipPercent(0);
                  setTipCustomTemp(tip.toString());
                  setTipModal(true);
                }}>
                <BevietBoldText style={isActiveTip(0) ? styles.activeTipText : styles.deactiveTipText}>Custom</BevietBoldText>
              </TouchableOpacity>
            </View>
          </View>

          {/* TAXES & FEES & TOTAL */}
          <View style={{ backgroundColor: "#FFF", borderRadius: 5, paddingHorizontal: 10, marginTop: 15, }}>
            <View style={{ marginVertical: 2, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <BevietText style={{ fontFamily: "beviet-regular", fontSize: 14 }}>SubTotal</BevietText>
              <BevietText style={{ fontSize: 14 }}>$ {(order?.subtotal / 100).toFixed(2)}</BevietText>
            </View>

            <View style={{ marginVertical: 2, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Pressable onPress={() => TaxesSheetRef.current?.snapToIndex(0)}>
                <BevietText style={{ fontSize: 14, textDecorationLine: "underline" }}>Tax and fees</BevietText>
              </Pressable>
              <BevietText style={{ fontSize: 14 }}>$ {getTaxAndFees(order?.tax, order?.total)}</BevietText>
              {/* <BevietText style={{ fontSize: 14 }}>$ {(getTax() + (getTotalPrice().toFixed(2) * (transactionPercentage / 100) + fixTransaction)).toFixed(2)}</BevietText> */}
            </View>
          
            <View style={{ marginVertical: 2, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <BevietText style={{ fontSize: 14 }}>Tips</BevietText>
              <BevietText style={{ fontSize: 14 }}>$ {tip.toFixed(2)}</BevietText>
            </View>
          
            {/* <View style={{ borderColor: "#eee", borderBottomWidth: 1, marginVertical: 5 }}></View> */}
          
            <View style={{ marginVertical: 2, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <BevietText style={{ fontSize: 14 }}>Total</BevietText>
              <BevietText style={{ fontSize: 14 }}>$ {(order?.total / 100 + tip).toFixed(2)}</BevietText>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={{flex: 0.1, justifyContent: "center", alignItems: "center" }}>
        <Button
          label={"Checkout"}
          // onPress={() => { PaymentSheetRef.current?.snapToIndex(0) }}
          onPress={() => { !checkoutLoading ? checkValidate() : null }}
          containerStyle={{
            marginBottom: 40,
            marginHorizontal: 15,
            borderRadius: 50,
            backgroundColor: "rgba(20, 67,51, 1)",
            width: "85%",
          }}
          loading={checkoutLoading}
          textStyle={{ color: "#FFF", fontSize: 25, fontFamily: "beviet-bold" }}
        />
      </View>
      
      {/* Tips Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={tipModal}
        onRequestClose={() => { }}
      >
        <View
          style={{
            backgroundColor: "#0004",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFF",
              paddingVertical: 20,
              paddingHorizontal: 20,
              width: Layout.window.width - 30,
            }}
          >
            <BevietBoldText style={{ fontSize: 22, color: "#000" }}>
              Tips amount
            </BevietBoldText>
            <View
              style={{
                height: 40,
                borderRadius: 5,
                borderColor: "#0004",
                borderWidth: 1,
                paddingLeft: 10,
                marginTop: 5,
              }}
            >
              <TextInput
                onChangeText={(text: string) => setTipCustomTemp(text)}
                value={tipCustomTemp.toString()}
                placeholder="Enter tip amount"
                keyboardType={"numeric"}
                style={{ flex: 1 }}
              />
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginTop: 20,
                justifyContent: "space-between",
              }}
            >
              <Button
                label={"Cancel"}
                onPress={() => {
                  setTipModal(false);
                }}
                containerStyle={{
                  borderRadius: 10,
                  backgroundColor: "#DDDDDD",
                  paddingHorizontal: 15,
                }}
                loading={loading}
                textStyle={{ color: "#007AFF", fontWeight: "bold" }}
              />
              <Button
                label={"Apply"}
                onPress={() => {
                  let temp = Number(tipCustomTemp);
                  setTip(temp);
                  setTipModal(false);
                }}
                containerStyle={{
                  borderRadius: 10,
                  backgroundColor: "#898B9F",
                  paddingHorizontal: 15,
                }}
                loading={loading}
                textStyle={{ color: "#FFF", fontWeight: "bold" }}
              />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Tax & Fees */}
      <BottomSheet
        ref={TaxesSheetRef}
        index={-1}
        snapPoints={snapPointsTaxes}
        onChange={handleTaxesSheetChanges}
        enablePanDownToClose={true}
        backdropComponent={renderTaxesBackdrop}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 10, }}>
          <BevietBoldText style={{ fontSize: 18 }}>Tax and fees:</BevietBoldText>
          
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
            <BevietText style={{ fontSize: 15 }}>Sales Tax: $ {getTax(order?.tax)}</BevietText>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 5 }}>
            <BevietText style={{ fontSize: 15 }}>Service Fee*: ${getFees(order?.total)}</BevietText>
          </View>
          <BevietText style={{ fontSize: 10, color: "#020202", }}>* This fee helps us operate the app</BevietText>
        </View>

        <Pressable style={styles.greenBtn} onPress={() => TaxesSheetRef.current?.close()}>
          <BevietBoldText style={{ fontSize: 20, color: "#fff" }}>Got it</BevietBoldText>
        </Pressable>
      </BottomSheet>

      {/* Checkout */}
      <BottomSheet
        ref={PaymentSheetRef}
        index={-1}
        snapPoints={snapPointsPayment}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetScrollView>
          <KeyboardAwareScrollView>
            <View style={{ display: 'flex', flexDirection: 'column', paddingHorizontal: 15 }}>
              <View style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <View style={styles.modalHeader}>
                  <BevietBoldText style={styles.modalTitle}>{`Total $${(order?.total / 100 + tip).toFixed(2)}`}</BevietBoldText>
                  <TouchableOpacity
                    onPress={() => {
                      !loading && PaymentSheetRef.current?.close();
                    }}
                    style={styles.modalClose}
                  >
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={30}
                      color="#144333"
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardBox}>
                  {Platform.OS === "ios" && (
                    <ApplePayButton
                      onPress={applePay}
                      type="plain"
                      buttonStyle="black"
                      borderRadius={4}
                      style={{ height: 50 }}
                    />
                  )}
                </View>
                <View style={{ alignItems: 'center', marginVertical: 15 }}>
                  <BevietText style={{ fontSize: 20 }}>Or Pay using a Credit Card</BevietText>
                </View>
                <CardForm
                  onFormComplete={(cardDetails) => {
                  }}
                  style={{ height: Platform.OS == "android" ? 320 : 200, }}
                />
              </View>
              <Button
                label="Pay"
                onPress={() => {
                  pay2Stripe();
                }}
                containerStyle={{
                  borderRadius: 100,
                  backgroundColor: "rgba(20, 67,51, 0.85)",
                  justifyContent: "center",
                }}
                loading={loading}
                textStyle={{ color: "#FFF", fontSize: 25, fontFamily: "beviet-bold" }}
              />
            </View>
          </KeyboardAwareScrollView>
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({

  greenBtn: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 15,
    borderRadius: 50,
    backgroundColor: "rgba(20, 67,51, 0.9)",
    width: "92%",
    paddingVertical: 12,
    marginTop: 20,
  },

  orderItem: {
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    paddingVertical: 12, 
    borderColor: '#eee',
    paddingHorizontal: 15,
  },

  loyaltyBox: {
    backgroundColor: '#E7EFEC', 
    // justifyContent: 'center', 
    alignItems: "center",
    flexDirection: 'row', 
    borderColor: '#144333', 
    borderRadius: 10, 
    padding: 10, 
    marginVertical: 10,
  },

  tipsRow: {
      flexDirection: "row",
      alignItems: 'center',
      justifyContent: "space-between",
      marginTop: 5,
      backgroundColor: "#E7EFEC",
      borderRadius: 100,
  },

  container: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    left: 15,
    top: Constants.statusBarHeight + 10,
    zIndex: 9999,
  },
  
  activeTip: {
    borderRadius: 99,
    backgroundColor: '#144333',
    height: 35,
    paddingHorizontal: 30,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  deactiveTip: {
    height: 35,
    paddingHorizontal: 30,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: "center",
  },
  activeTipText: {
    fontSize: 15,
    color: '#FFF',
  },
  deactiveTipText: {
    fontSize: 15,
    color: '#144333',
  },
  modalHeader: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    marginVertical: 10,
  },
  modalTitle: {
    fontSize: 18,
    flex: 1,
    textAlign: "center",
    color: textColorPrimary,
  },
  modalClose: {
    alignItems: "flex-end",
    padding: 4,
    position: "absolute",
    right: 0,
    marginRight: 15,
    borderRadius: 8,
  },
  cardBox: {
    marginTop: 20,
  },
  cardText: {
    fontSize: 16,
    color: textColorPrimary,
    fontWeight: "bold",
    marginLeft: 10,
  },
  rowVeiw: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
});
