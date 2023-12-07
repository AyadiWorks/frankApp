import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";

import {
  ApplePayButton,
  CardForm,
  useApplePay,
  useConfirmPayment,
  useStripe,
} from "@stripe/stripe-react-native";

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

// Api's
import Api from "../api/endpoints";

import * as Location from "expo-location";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button as ButtonPaper, Divider, Surface } from "react-native-paper";
import SafeAreaView from "react-native-safe-area-view";
import Constants from "expo-constants";
import Button from "../components/Button";
import { useToast } from "react-native-toast-notifications";
import ToggleSwitch from "toggle-switch-react-native";
import BottomSheetView from "../components/BottomSheetView";
import {
  MaterialCommunityIcons,
  AntDesign,
  FontAwesome5,
} from "@expo/vector-icons";
import { BevietBoldText, BevietText } from "../components/Text";
import Colors from "../constants/Colors";

import {
  ACCOUNT_URL,
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY,
  STYLE_COLOR_PRIMARY,
  STYLE_COLOR_SECONDARY,
  STRIPE_VERSION,
  STRIPE_MERCHANT,
} from "../constants/GlobalConstants";

import Layout from "../constants/Layout";
import useColorScheme from "../hooks/useColorScheme";
import { MapView, OrderPlaced } from "../navigation/Helpers";
import { RootStackScreenProps } from "../types";
import { getGlobalState, useGlobalState } from "../utils/Global";
import {
  STORAGE_CART,
  STORAGE_USER,
  getData,
  storeData,
} from "../utils/Helpers";

// Svg's
import SVGDelivery from "../assets/images/delivery.svg";
import SVGPickup from "../assets/images/pickup.svg";
import SVGInstruction from "../assets/images/instruction.svg";
import SVGPromo from "../assets/images/promo.svg";
import SVGLoyalty from "../assets/images/loyalty-checkout.svg";
import SVGTip from "../assets/images/tip.svg";

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;
const secondaryColor = STYLE_COLOR_SECONDARY;

interface IRegion {
  latitude: number;
  longitude: number;
}

export default function CheckOutScreen({
  navigation,
}: RootStackScreenProps<"CheckOut">) {
  // STRIPE
  const { presentApplePay, confirmApplePayPayment, isApplePaySupported } =
    useApplePay();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [paymentSheetEnabled, setPaymentSheetEnabled] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<any>(null);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [delivery, setDelivery] = useGlobalState("delivery");
  const [menu, setMenu] = useGlobalState<any>("menu");
  const [address, setAddress] = useGlobalState<any>("address");
  const [deliveryAddress, setDeliveryAddress] =
    useGlobalState<any>("deliveryAddress");
  const [deliveryAddressList, setDeliveryAddressList] = useGlobalState(
    "deliveryAddressList"
  );
  const [deliveryFee, setDeliveryFee] = useGlobalState("deliveryFee");
  const [taxPercent, setTaxPercent] = useGlobalState("taxPercent");
  const [taxIncluded, setTaxIncluded] = useGlobalState("taxIncluded");
  const [outLetId, setOutLetId] = useGlobalState("outletId");
  const [last4, setLast4Card] = useState("");
  const [comment, setComment] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponInfo, setCouponInfo] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [tipCustom, setTipCustom] = useState(false);
  const [tipCustomTemp, setTipCustomTemp] = useState<any>(0);
  const [tipPercent, setTipPercent] = useState(20);
  const [customTipAmount, setCustomTipAmount] = useState(0);
  const [tipModal, setTipModal] = useState(false);
  const [loyalPoint, setLoyalPoint] = useState(0);
  const [loyalTemp, setLoyalTemp] = useState("");
  const [loyalMax, setLoyalMax] = useState(0);
  const [loyalty, setLoyalty] = useState(false);
  const [carts, setCarts] = useGlobalState("cart");
  const [loyalModal, setLoyalModal] = useState(false);
  const [fixTransaction, setFixTransaction] = useState(1);
  const [transactionPercentage, setTransactionPecentage] = useState(1);

  const [minBasket, setMinBasket] = useState(0);
  const colorScheme = useColorScheme();
  const toast = useToast();
  const [payType, setPayType] = useState("Card");
  const { confirmPayment } = useConfirmPayment();
  const [region, setRegion] = useState<IRegion>({
    latitude: 42.813297,
    longitude: -73.941177,
  });
  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetRefTax = useRef<BottomSheet>(null);
  const PaymentSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["75%"], []);
  const snapPointsPayment = useMemo(() => [600], []);
  const handleSheetChanges = useCallback((index: number) => {}, []);

  const [basket, setBasket] = useState(0);
  const [couponNewPrice, setCouponNewPrice] = useState(0);
  const [subTotalPrice, setSubTotalPrice] = useState(0);
  const [deliveryData, setDeliveryData] = useState<any>(null);
  const [commentModal, setCommentModal] = useState(false);
  const [questionPopupModal, setQuestionPopupModal] = useState(false);
  const [activePaymentTypes, setActivePaymentTypes] = useState([]);

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

  const getCheckoutPickupTypes = async () => {
    let accountUrl = getGlobalState("account_url");
    let brancheUrl = getGlobalState("branche_url");

    // console.log("I'm sending", accountUrl, brancheUrl);

    let response: any = await Api.getCheckoutPaymentType(
      accountUrl,
      brancheUrl
    );

    try {
      if (response.data.data) {
        // console.log("getCheckoutPickupTypes RESP", response.data.data.orderingService);
        let deliveryObject = response.data.data.orderingService.filter(
          (a: any) => a.name === "delivery"
        );
        let pickupObject = response.data.data.orderingService.filter(
          (a: any) => a.name === "pickup"
        );
        let result: any = [];
        result[0] = deliveryObject[0];
        result[1] = pickupObject[0];
        setActivePaymentTypes(result);
        // console.log("Result --->", result);
      }
    } catch (error) {}
  };

  const checkPaymentType = (delivery: boolean, type: string) => {
    if (delivery) {
      // DELIVERY
      let searchForType = activePaymentTypes[0].payment?.filter(
        (a: any) => a.name === type
      );

      // console.log("I've searched for ", type, " And found", searchForType);
      if (searchForType[0].is_enabled) {
        return true;
      } else {
        return false;
      }
    } else {
      // PICKUP
      let searchForType = activePaymentTypes[1].payment?.filter(
        (a: any) => a.name === type
      );

      // console.log("I've searched for ", type, " And found", searchForType);
      if (searchForType[0].is_enabled) {
        return true;
      } else {
        return false;
      }
    }
  };

  const getLoyalPointAmount = async () => {
    let response: any = await Api.getLoyalPoint();
    try {
      if (response.data.status) {
        // console.log("I have loyaltyyy data", response.data.data);
        setLoyalMax(response.data.data);
        setLoyalPoint(response.data.data);
      }
    } catch (error) {}
  };

  const getAccountByAccountName = async () => {
    let response: any = await Api.getAccountByAccountName();

    try {
      if (response.data.data) {
        setFixTransaction(response.data.data.fixTransactionFee);
        setTransactionPecentage(response.data.data.percentTransactionFee);
      }
    } catch (error) {}
  };

  const getLocationString = () => {
    if (deliveryAddress) {
      return deliveryAddress.location;
    }
    return "Click here to select address";
  };

  const getPickupAddress = () => {
    if (address != null) {
      let temp: any = address[0];
      return temp.address;
    }
    return "";
  };

  const checkCoupon = async () => {
    if (couponLoading) return;
    let params = {
      code: coupon,
      accountUrl: ACCOUNT_URL,
    };
    setCouponLoading(true);
    Api.checkUsageDiscount(params).then((response: any) => {
      try {
        if (response.data.status) {
          setCouponInfo(response.data.data);
          setCouponNewPrice(getCouponPrice());
        } else {
          toast.show("Invalide coupon code", {
            type: "danger",
            placement: "top",
          });
        }
      } catch (error) {}
      setCouponLoading(false);
    });
  };

  const getBasket = () => {
    let subTotal = 0;
    carts.data.forEach((item: any) => {
      let menuPrice = getPrice(item);
      subTotal += menuPrice;
    });
    return subTotal;
  };

  const getPrice = (item: any) => {
    const amount = item.amount;
    const temp = item.menu;
    let optionPrice = 0;
    temp.modifier_List.forEach((value: any) => {
      value.modifiers.forEach((element: any) => {
        if (element.checked == true) {
          optionPrice += element.price * element.quantity;
        }
      });
    });
    return amount * (temp.price + optionPrice);
  };

  const getTax = () => {
    if (taxIncluded) {
      if (loyalty) {
        return ((subTotalPrice - loyalPoint) * taxPercent) / 100;
      } else {
        return (subTotalPrice * taxPercent) / 100;
      }
    }
    return 0;
  };

  const getSubTotalPrice = (): number => {
    return basket - couponNewPrice;
  };

  const getCouponPrice = (): number => {
    if (couponInfo) {
      if (couponInfo.itemDiscounts == "") {
        return (Number(subTotalPrice) * couponInfo.amount) / 100;
      } else {
        let coupon_price = 0;
        let ids = couponInfo.itemDiscounts.split(",");
        carts.data.forEach((item: any) => {
          let menuPrice = getPrice(item);
          if (ids.indexOf(item.menu.itemId)) {
            coupon_price += (menuPrice * couponInfo.amount) / 100;
          }
        });
        return coupon_price;
      }
    }
    return 0;
  };

  const getShippingFee = () => {
    if (delivery) return deliveryFee;
    else return 0;
  };

  const getTip = () => {
    if (tipCustom == false) return (subTotalPrice * tipPercent) / 100;
    else return customTipAmount;
  };

  const getDiscount = () => {
    let discount = 0;
    return discount;
  };

  const getTotalPrice = () => {
    if (loyalty) {
      let total = 0;
      if (deliveryAddress) {
        total +=
          subTotalPrice + getTip() + getTax() + getShippingFee() - loyalPoint;
      } else {
        total += subTotalPrice + getTip() + getTax() - loyalPoint;
      }
      if (total < 0) {
        return 0;
      }
      return total;
    }
    if (deliveryAddress) {
      return subTotalPrice + getTip() + getTax() + getShippingFee();
    } else {
      return subTotalPrice + getTip() + getTax();
    }
  };

  const applePay = async () => {
    PaymentSheetRef.current?.close();
    if (!isApplePaySupported) {
      toast.show("Apple pay is not supported", {
        type: "danger",
        placement: "top",
      });
      return;
    }
    let totalToPay = getTotalPrice().toFixed(2);

    const { error } = await presentApplePay({
      cartItems: [{ label: "TradersExpressDeli", amount: totalToPay }],
      country: "US",
      currency: "USD",
      jcbEnabled: true,
    });
    if (error) {
      toast.show("Payment processing failed", {
        type: "danger",
        placement: "top",
      });
    } else {
      const info = {
        currency: "USD",
        price: totalToPay,
        type: "card",
        restaurant_name: getGlobalState("account_url"),
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
          } else {
            setPayType("Apple pay");
            checkout("Apple pay");
          }
        }
      } catch (error) {}
    }
  };

  const checkout = async (id: string) => {
    if (loading) {
      return;
    }
    if (delivery) {
      if (minBasket > subTotalPrice) {
        toast.show(`Min basket USD ${minBasket}`, {
          type: "danger",
          placement: "top",
        });
        return;
      }
    }
    setLoading(true);
    const date = new Date().toISOString().slice(0, 10);
    let temp = { ...carts };
    let items: any[] = [];
    temp.data.forEach((element: any, index: number) => {
      let checkItem: any = {};
      let menu = element.menu;
      checkItem.id = menu.itemId;
      checkItem.price = menu.price;
      checkItem.quantity = element.amount;
      let modifier_temp: any = [];
      menu.modifier_List.forEach((section: any) => {
        section.modifiers.forEach((modifier: any) => {
          let elem_temp: any = {};
          elem_temp.modifier_listId = modifier.modifyListId;
          elem_temp.modifierId = modifier.modifyID;
          elem_temp.price = modifier.price;
          if (modifier.checked) {
            elem_temp.quantity = modifier.quantity;
            modifier_temp.push(elem_temp);
            checkItem.price += elem_temp.price;
          }
        });
      });
      checkItem.modifiers = modifier_temp;
      items.push(checkItem);
    });

    let restaurant_id = getGlobalState("address")
      ? getGlobalState("address")[0].id
      : "";

    let checkout_body = {
      areaId: delivery
        ? deliveryAddress?.id
        : "00000000-0000-0000-0000-000000000000",
      note: comment,
      payment_intent: id,
      channel: "Mobile App",
      payment_online: "stripe",
      order_date: date,
      order_day: "Today",
      order_time: "ASAP",
      ordering_service: delivery ? "delivery" : "pickup",
      payment_method: payType === "Card" ? "*****4242:" + id : payType,
      outletId: restaurant_id,
      discountId: couponInfo
        ? couponInfo.id
        : "00000000-0000-0000-0000-000000000000",
      loyal_point_using: loyalty ? loyalPoint : 0,
      discount_sale: 0,
      tax_value: taxPercent,
      price_after_discount: subTotalPrice,
      tip_value: getTip(),
      service_fee: 0,
      items: items,
    };

    let response: any = await Api.checkoutOrder(checkout_body);
    if (response.data.status == 1) {
      let temp = {
        data: [],
      };
      PaymentSheetRef.current?.close();
      setCarts({
        data: [],
        account_url: "",
        branche_url: "",
        restaurant_name: "",
      });
      await storeData(STORAGE_CART, JSON.stringify(""));
      setCheckoutLoading(false);
      navigation.replace(OrderPlaced);
      Alert.alert(
        "Frank cares",
        "The payment was confirmed successfully, Thank you !"
      );
    } else {
      toast.show(`Checkout failed. ${response.data.message}`, {
        type: "danger",
        placement: "top",
      });
    }
    setLoading(false);
  };

  const pay2Stripe = async () => {
    // CHECK payment intent -> pe_

    setLoading(true);

    let totalSub = subTotalPrice - loyalPoint;
    if (totalSub < 0) {
      totalSub = 0;
    }

    let totalToPay = getTotalPrice();

    const info = {
      currency: "USD",
      price: totalToPay,
      type: "card",
      restaurant_name: getGlobalState("account_url"),
    };

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
      } else if (paymentIntent) {
        setPayType("Card");
        checkout(paymentIntent.id);
      }
    } catch (error) {
      console.log("error : ", error);
    }
    setLoading(false);
  };

  const onDeliveryPress = () => {
    setDelivery(true);
    !deliveryAddress && bottomSheetRef.current?.snapToIndex(0);
  };

  // Stripe
  const checkValidate = async () => {
    if (delivery) {
      if (deliveryAddress == null) {
        toast.show("Select address to delivery", {
          type: "danger",
          placement: "top",
        });
        return;
      }
    }
    // Init Payment Sheet
    let intent: any = await initialisePaymentSheet();

    if (intent) {
      openStripePaymentSheet(intent);
    } else {
      Alert.alert("Frank cares", "Init Stripe failed, Please try again");
    }
  };

  const openStripePaymentSheet = async (intent: any) => {
    if (!intent) {
      return;
    }

    const { error } = await presentPaymentSheet({ intent });

    if (error) {
      Alert.alert(`Frank cares`, error.message);
      setCheckoutLoading(false);
      return;
    } else {
      setPayType("Card");
      checkout(intent);
    }
  };

  const fetchPaymentIntent = async () => {
    let totalToPay = getTotalPrice();

    const info = {
      currency: "USD",
      price: totalToPay,
      type: "card",
      restaurant_name: getGlobalState("account_url"),
    };

    // let response: any = await Api.createPaymentIntent(info);
    let response: any = await Api.getStripePaymentIntent(info);

    if (response.data.status == 0) {
      toast.show("Create payment intent failed.", {
        type: "danger",
        placement: "top",
      });
      return;
    }

    let paymentIntent: string = response.data.data;

    return paymentIntent;
  };

  const fetchEphemeralkey = async () => {
    let user_data = await getData(STORAGE_USER);

    let response: any = await Api.getStripeEphemeralKey(
      user_data.stripeCustomerId
    );

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
      style: "automatic",
    });

    if (!error) {
      return paymentIntent;
    }
    return false;
  };

  const getRestaurantFees = async () => {
    // (total x transaction_percent) + fix transaction
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

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("no permission");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        ...region,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
    setDeliveryData(address[0]?.deliveryData);
    setDeliveryFee(address[0]?.deliveryData.deliveryFee);
    setMinBasket(address[0]?.deliveryData.minBasket);
    getLoyalPointAmount();
    setDelivery(true);
    // GET FEES
    getRestaurantFees();
  }, []);

  useEffect(() => {
    getCheckoutPickupTypes();
  }, []);

  useEffect(() => {
    setBasket(getBasket());
    if (couponNewPrice == 0) {
      setCouponNewPrice(getCouponPrice());
      setSubTotalPrice(getSubTotalPrice());
    }
  });

  useEffect(() => {
    setSubTotalPrice(getSubTotalPrice());
  }, [couponNewPrice]);

  useEffect(() => {
    if (loyalty) {
      setLoyalModal(true);
    }
  }, [loyalty]);

  useEffect(() => {
    !deliveryAddress && setQuestionPopupModal(true);
  }, [deliveryAddress]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          backgroundColor: "white",
          borderRadius: 99,
          paddingHorizontal: 15,
        }}
      >
        <AntDesign name="arrowleft" size={30} color="#000" />
      </TouchableOpacity>

      <BevietBoldText
        style={{ fontSize: 30, color: "#181818", paddingHorizontal: 15 }}
      >
        Checkout
      </BevietBoldText>

      <ScrollView contentContainerStyle={{ paddingTop: 15 }}>
        <View
          style={{
            flexDirection: "row",
            borderColor: "#144333",
            borderWidth: 1,
            borderRadius: 99,
            marginHorizontal: 15,
          }}
        >
          <TouchableOpacity
            onPress={() => onDeliveryPress()}
            style={[
              styles.typeButton,
              {
                flex: 1,
                backgroundColor: delivery ? "#144333" : "#FFF",
                paddingHorizontal: 15,
                paddingVertical: 8,
              },
            ]}
          >
            <BevietText
              style={{ color: delivery ? "white" : "#144333", fontSize: 12 }}
            >
              Delivery
            </BevietText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDelivery(false)}
            style={[
              styles.typeButton,
              {
                flex: 1,
                backgroundColor: !delivery ? "#144333" : "#FFF",
                paddingHorizontal: 15,
                paddingVertical: 8,
              },
            ]}
          >
            <BevietText
              style={{ color: !delivery ? "white" : "#144333", fontSize: 12 }}
            >
              Pickup
            </BevietText>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 15,
            paddingHorizontal: 15,
          }}
        >
          {delivery ? <SVGDelivery /> : <SVGPickup />}
          <View style={{ flex: 1, marginLeft: 15 }}>
            <BevietBoldText>
              {delivery ? "Delivery ASAP" : "Picup ASAP"}
            </BevietBoldText>
            <BevietText style={{ color: "#020202", fontSize: 11 }}>
              {delivery
                ? `Delivery in ${deliveryData?.preparation} mins`
                : `Pickup in ${address[0]?.time} min from :`}
            </BevietText>
            {delivery ? (
              <TouchableOpacity
                onPress={() => {
                  bottomSheetRef.current?.snapToIndex(0);
                }}
              >
                <BevietText style={{ color: "#144333", fontSize: 11 }}>
                  {getLocationString()}
                </BevietText>
              </TouchableOpacity>
            ) : (
              <BevietText style={{ color: "#144333", fontSize: 11 }}>
                {getPickupAddress()}
              </BevietText>
            )}
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: "#ddd", marginLeft: 15 }} />

        <TouchableOpacity
          onPress={() => {
            setCommentModal(true);
          }}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: 15,
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <SVGInstruction />
            <BevietText
              style={{
                fontSize: 13,
                fontWeight: "400",
                color: "#020202",
                marginLeft: 15,
              }}
            >
              Add delivery instructions
            </BevietText>
          </View>
          <AntDesign name="right" size={20} color="#707070" />
        </TouchableOpacity>

        <View style={{ height: 1, backgroundColor: "#ddd", marginLeft: 15 }} />

        <View style={{ padding: 15 }}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <SVGPromo />
            <BevietText
              style={{
                fontSize: 13,
                fontWeight: "400",
                color: "#020202",
                marginLeft: 15,
              }}
            >
              Promo code
            </BevietText>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <TextInput
              onChangeText={(text: string) => setCoupon(text)}
              value={coupon}
              placeholder="Promo code"
              placeholderTextColor="#020202"
              editable={!couponInfo}
              style={{
                flex: 1,
                paddingLeft: 10,
                color: "#020202",
                fontSize: 13,
                height: 40,
                borderWidth: 1,
                borderColor: primaryColor,
                borderRadius: 99,
              }}
            />
            <Button
              label={couponInfo ? "Applied" : "Apply"}
              onPress={() => {
                couponInfo == null && checkCoupon();
              }}
              loading={couponLoading}
              containerStyle={{
                width: 100,
                borderRadius: 99,
                height: 40,
                backgroundColor: couponInfo ? "#B4B4B4" : primaryColor,
                marginLeft: 20,
              }}
              textStyle={{
                color: "#FFF",
                flex: 1,
                fontWeight: "bold",
                fontSize: 14,
              }}
            />
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: "#ddd", marginLeft: 15 }} />

        <View
          style={{
            padding: 15,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <SVGLoyalty />
            <BevietText style={{ fontSize: 13, marginLeft: 15 }}>
              Loyalty
            </BevietText>
          </View>
          <ToggleSwitch
            isOn={loyalty}
            onColor={primaryColor}
            offColor={"#898B9A"}
            label=""
            size="medium"
            onToggle={(isOn: boolean) => {
              setLoyalty(isOn);
              if (!isOn) {
                getLoyalPointAmount();
              }
            }}
          />
        </View>

        <View style={{ padding: 15 }}>
          <BevietText style={{ fontSize: 14 }}>
            Use your loyalty balance to get up to {loyalPoint.toFixed(2)} off
          </BevietText>
        </View>

        <View style={{ height: 1, backgroundColor: "#ddd", marginLeft: 15 }} />

        <View style={{ padding: 15 }}>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <SVGTip />
            <BevietText style={{ fontSize: 13, marginLeft: 15 }}>
              {delivery ? "Driver Tip" : "Staff Tip"}
            </BevietText>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              backgroundColor: "#E7EFEC",
              borderRadius: 99,
              marginTop: 15,
            }}
          >
            <Button
              label="10%"
              onPress={() => {
                setTipCustom(false);
                setTipPercent(10);
              }}
              containerStyle={
                tipPercent == 10 && tipCustom == false
                  ? styles.tipActiveButton
                  : styles.tipButton
              }
              textStyle={{
                color:
                  tipPercent == 10 && tipCustom == false ? "#FFF" : "#020202",
                fontSize: 14,
              }}
            />
            <Button
              label="15%"
              onPress={() => {
                setTipCustom(false);
                setTipPercent(15);
              }}
              containerStyle={
                tipPercent == 15 && tipCustom == false
                  ? styles.tipActiveButton
                  : styles.tipButton
              }
              textStyle={{
                color:
                  tipPercent == 15 && tipCustom == false ? "#FFF" : "#020202",
                fontSize: 14,
              }}
            />
            <Button
              label="20%"
              onPress={() => {
                setTipCustom(false);
                setTipPercent(20);
              }}
              containerStyle={
                tipPercent == 20 && tipCustom == false
                  ? styles.tipActiveButton
                  : styles.tipButton
              }
              textStyle={{
                color:
                  tipPercent == 20 && tipCustom == false ? "#FFF" : "#020202",
                fontSize: 14,
              }}
            />
            <Button
              onPress={() => {
                setTipCustom(true);
                // setTipCustomTemp(customTipAmount.toFixed(2));
                setTipModal(true);
              }}
              label={tipCustom ? `$ ${customTipAmount.toFixed(2)}` : "Custom"}
              containerStyle={
                tipCustom ? styles.tipActiveButton : styles.tipButton
              }
              textStyle={{
                color: tipCustom ? "#FFF" : "#020202",
                fontSize: 14,
              }}
            />
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: "#ddd" }} />

        <View style={{ padding: 15 }}>
          {couponInfo && (
            <View style={styles.rowVeiw}>
              <BevietText style={{ fontSize: 18, fontWeight: "600" }}>
                Basket
              </BevietText>
              <BevietText style={{ fontSize: 15, fontWeight: "600" }}>
                ${basket.toFixed(2)}
              </BevietText>
            </View>
          )}
          {couponInfo && (
            <View style={styles.rowVeiw}>
              <BevietText style={{ fontSize: 18, fontWeight: "600" }}>
                Coupon
              </BevietText>
              <BevietText style={{ fontSize: 15, fontWeight: "600" }}>
                -${couponNewPrice.toFixed(2)}
              </BevietText>
            </View>
          )}

          <View style={styles.rowVeiw}>
            <BevietText style={{ fontSize: 18, fontWeight: "600" }}>
              Subtotal
            </BevietText>
            <BevietText style={{ fontSize: 15, fontWeight: "600" }}>
              ${subTotalPrice.toFixed(2)}
            </BevietText>
          </View>

          <View style={styles.rowVeiw}>
            <TouchableOpacity
              onPress={() => bottomSheetRefTax.current?.snapToIndex(0)}
            >
              <BevietBoldText
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                Tax and Fees
              </BevietBoldText>
            </TouchableOpacity>
            <BevietText style={{ fontSize: 15, fontWeight: "600" }}>
              $
              {(
                getTax() +
                (getTotalPrice().toFixed(2) * (transactionPercentage / 100) +
                  fixTransaction)
              ).toFixed(2)}
            </BevietText>
          </View>

          {delivery && deliveryAddress && (
            <View style={styles.rowVeiw}>
              <BevietText style={{ fontSize: 18, fontWeight: "600" }}>
                Shipping fee
              </BevietText>
              <BevietText style={{ fontSize: 15, fontWeight: "600" }}>
                ${getShippingFee().toFixed(2)}
              </BevietText>
            </View>
          )}

          {loyalty && (
            <View style={styles.rowVeiw}>
              <BevietText style={{ fontSize: 18, fontWeight: "600" }}>
                Loaylty
              </BevietText>
              <BevietText style={{ fontSize: 15, fontWeight: "600" }}>
                - ${loyalPoint.toFixed(2)}
              </BevietText>
            </View>
          )}
          <View style={styles.rowVeiw}>
            <BevietText style={{ fontSize: 18, fontWeight: "600" }}>
              Tip
            </BevietText>
            <BevietText style={{ fontSize: 15, fontWeight: "600" }}>
              ${getTip().toFixed(2)}
            </BevietText>
          </View>
          {getDiscount() > 0 && (
            <View style={styles.rowVeiw}>
              <BevietText style={{ fontSize: 18, fontWeight: "600" }}>
                Discount
              </BevietText>
              <BevietText style={{ fontSize: 15, fontWeight: "600" }}>
                ${getDiscount().toFixed(2)}
              </BevietText>
            </View>
          )}
          <View style={styles.rowVeiw}>
            <BevietText style={{ fontSize: 18, fontWeight: "600" }}>
              Total
            </BevietText>
            <BevietText style={{ fontSize: 15, fontWeight: "600" }}>
              ${getTotalPrice().toFixed(2)}
            </BevietText>
          </View>
        </View>

        <Button
          label={"Checkout"}
          // onPress={() => { checkValidate() }}
          onPress={() => {
            !checkoutLoading ? checkValidate() : null;
          }}
          // onPress={() => { !checkoutLoading ? initialisePaymentSheet() : null }}
          containerStyle={{
            marginTop: 20,
            borderRadius: 99,
            backgroundColor: checkoutLoading ? "lightgray" : primaryColor,
            marginHorizontal: 10,
            marginBottom: 20,
          }}
          loading={checkoutLoading}
          textStyle={{ color: "#FFF", fontWeight: "bold" }}
        />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={questionPopupModal}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackground}>
          <View
            style={{
              backgroundColor: "#FFF",
              paddingVertical: 20,
              paddingHorizontal: 20,
              width: Layout.window.width - 30,
              borderRadius: 8,
            }}
          >
            <BevietBoldText style={{ fontSize: 18, fontWeight: "600" }}>
              Would you like your order delivered?
            </BevietBoldText>
            <BevietText
              style={{ fontSize: 14, fontWeight: "600", marginTop: 15 }}
            >
              This will help us confirm the store’s availability and delivery
              fees
            </BevietText>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Button
                label={"Select delivery address"}
                onPress={() => {
                  console.log("DELIVERY");
                  setQuestionPopupModal(false);
                  bottomSheetRef.current?.snapToIndex(0);
                }}
                containerStyle={{
                  marginTop: 20,
                  borderRadius: 99,
                  backgroundColor: primaryColor,
                  // marginHorizontal: 10,
                  marginBottom: 20,
                  height: 35,
                  width: 160,
                }}
                loading={loading}
                textStyle={{ color: "#FFF", fontWeight: "bold", fontSize: 12 }}
              />
              <Button
                label={"Choose pickup instead"}
                onPress={() => {
                  console.log("PICKUP");
                  setQuestionPopupModal(false);
                  setDelivery(false);
                }}
                containerStyle={{
                  marginTop: 20,
                  borderColor: primaryColor,
                  borderWidth: 1,
                  borderRadius: 99,
                  backgroundColor: "#FFF",
                  // marginHorizontal: 10,
                  marginBottom: 20,
                  height: 35,
                  width: 160,
                }}
                loading={loading}
                textStyle={{
                  color: primaryColor,
                  fontWeight: "bold",
                  fontSize: 12,
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Delivery Instructions Modal */}
      <Modal animationType="slide" transparent={true} visible={commentModal}>
        <View style={styles.modalBackground}>
          <View style={styles.modal}>
            <BevietBoldText style={{ fontSize: 20, marginBottom: 8 }}>
              Delivery Instructions
            </BevietBoldText>

            <TextInput
              multiline
              numberOfLines={5}
              onChangeText={(text: string) => setComment(text)}
              value={comment}
              placeholder="e.g. ring doorbell, leave in front of the main door, Call when here..."
              style={styles.comment}
              placeholderTextColor="#888"
            />
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginTop: 20,
                justifyContent: "space-between",
              }}
            >
              <Pressable onPress={() => setCommentModal(false)}>
                <BevietBoldText style={{ color: "#144333" }}>
                  Cancel
                </BevietBoldText>
              </Pressable>

              <Pressable
                style={styles.confirmBtn}
                onPress={() => setCommentModal(false)}
              >
                <BevietBoldText style={{ color: "#fff" }}>
                  Confirm
                </BevietBoldText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Tips Modal */}
      <Modal animationType="slide" transparent={true} visible={tipModal}>
        <View style={styles.modalBackground}>
          <View style={styles.modal}>
            <BevietBoldText style={{ fontSize: 20, marginBottom: 8 }}>
              Tip amount
            </BevietBoldText>

            <TextInput
              onChangeText={(text: string) => setTipCustomTemp(text)}
              value={tipCustomTemp.toString()}
              placeholder="$"
              placeholderTextColor={"#000"}
              keyboardType={"numeric"}
              style={styles.loyaltyInput}
            />

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
                justifyContent: "space-between",
              }}
            >
              <Pressable onPress={() => setTipModal(false)}>
                <BevietBoldText style={{ color: "#144333" }}>
                  Cancel
                </BevietBoldText>
              </Pressable>

              <Pressable
                style={styles.confirmBtn}
                onPress={() => {
                  let temp = Number(tipCustomTemp);
                  setCustomTipAmount(temp);
                  setTipModal(false);
                }}
              >
                <BevietBoldText style={{ color: "#fff" }}>
                  Confirm
                </BevietBoldText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loyalty Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={loyalModal}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modal}>
            <BevietBoldText style={{ fontSize: 20 }}>
              Loyalty points redemption
            </BevietBoldText>

            <TextInput
              onChangeText={(text: string) => setLoyalTemp(text)}
              value={loyalTemp.toString()}
              placeholder="$"
              placeholderTextColor={"#000"}
              keyboardType={"numeric"}
              style={styles.loyaltyInput}
            />

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, color: "#000" }}>Maximum use:</Text>
              <Text style={{ fontSize: 16, color: "#000", fontWeight: "bold" }}>
                {" "}
                ${loyalMax.toFixed(2)}
              </Text>
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                // marginTop: 20,
                justifyContent: "space-between",
              }}
            >
              <Pressable
                onPress={() => {
                  setLoyalty(false);
                  setLoyalModal(false);
                }}
              >
                <BevietBoldText style={{ color: "#144333" }}>
                  Cancel
                </BevietBoldText>
              </Pressable>

              <Pressable
                style={styles.confirmBtn}
                onPress={() => {
                  let temp = Number(loyalTemp);
                  let max = loyalMax;
                  if (temp < 0 || temp > max) {
                    toast.show("Please input valid points.", {
                      type: "danger",
                      placement: "top",
                    });
                    return;
                  }
                  if (temp > subTotalPrice) {
                    temp = subTotalPrice;
                  }

                  setLoyalPoint(temp);
                  setLoyalModal(false);
                }}
              >
                <BevietBoldText style={{ color: "#fff" }}>
                  Confirm
                </BevietBoldText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={false}
        backdropComponent={renderBackdrop}
        onClose={() => {
          if (delivery && !deliveryAddress) {
            // toast.show("Please select delivery address.", {
            //   type: "danger",
            //   placement: "top",
            //   duration: 1500,
            // });
            bottomSheetRef.current?.close();
          }
        }}
      >
        <BottomSheetView
          onNewAddress={() => {
            bottomSheetRef.current?.close();
            navigation.navigate(MapView, { region, edit: false, id: -1 });
          }}
          onEditAddress={(item: any) => {
            bottomSheetRef.current?.close();
            let init = {
              latitude: item.lat,
              longitude: item.lng,
            };
            navigation.navigate(MapView, {
              region: init,
              edit: true,
              id: item.id,
            });
          }}
          onSelectAddress={() => {
            bottomSheetRef.current?.close();
          }}
          // isAddress={(val: any) => val ? setQuestionPopupModal(true) : setQuestionPopupModal(false)  }
        />
      </BottomSheet>

      <BottomSheet
        ref={bottomSheetRefTax}
        index={-1}
        // snapPoints={snapPoints}
        snapPoints={["30%"]}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        <View style={{ marginLeft: 20 }}>
          <BevietBoldText style={{ fontSize: 18, fontWeight: "800" }}>
            Tax and Fees:{" "}
          </BevietBoldText>
          <BevietText
            style={{ fontSize: 18, fontWeight: "800", marginTop: 10 }}
          >
            Sales Tax: ${getTax().toFixed(2)}{" "}
          </BevietText>
          <BevietText
            style={{ fontSize: 18, fontWeight: "800", marginTop: 10 }}
          >
            Service Fee: $
            {(
              getTotalPrice() * (transactionPercentage / 100) +
              fixTransaction
            ).toFixed(2)}
          </BevietText>
          <BevietText
            style={{ fontSize: 14, fontWeight: "800", marginTop: 10 }}
          >
            * This fee helps us operate the app{" "}
          </BevietText>

          <Button
            label={"Got it"}
            onPress={() => {
              bottomSheetRefTax.current?.close();
            }}
            containerStyle={{
              marginTop: 20,
              borderRadius: 99,
              backgroundColor: primaryColor,
              marginHorizontal: 10,
              marginBottom: 20,
            }}
            textStyle={{ color: "#FFF", fontWeight: "bold" }}
          />
        </View>
      </BottomSheet>

      {/* Payment */}
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
            <View style={styles.modalHeader}>
              <Text
                style={styles.modalTitle}
              >{`Paying $${getTotalPrice().toFixed(2)}`}</Text>

              <TouchableOpacity
                onPress={() => {
                  !loading && PaymentSheetRef.current?.close();
                }}
                style={styles.modalClose}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={30}
                  color="gray"
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

              {delivery ? (
                <>
                  {activePaymentTypes.length > 0 &&
                  checkPaymentType(true, "CASH") ? (
                    // {/* Pay cash */}
                    <TouchableOpacity
                      style={[
                        styles.rowVeiw,
                        {
                          marginTop: 10,
                          paddingVertical: 8,
                          borderWidth: 1,
                          borderColor: primaryColor,
                          borderRadius: 5,
                        },
                      ]}
                      onPress={() => {
                        setPayType("Cash");
                        checkout("Cash");
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MaterialCommunityIcons
                          name="cash-multiple"
                          size={34}
                          color="black"
                        />
                        <Text style={styles.cardText}>Cash</Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}

                  {/* Pay on delivery with card */}
                  {activePaymentTypes.length > 0 &&
                  checkPaymentType(true, "CARD") ? (
                    <TouchableOpacity
                      style={[
                        styles.rowVeiw,
                        {
                          marginTop: 10,
                          paddingVertical: 8,
                          borderWidth: 1,
                          borderColor: primaryColor,
                          borderRadius: 5,
                        },
                      ]}
                      onPress={() => {
                        setPayType("Cash");
                        checkout("Cash");
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MaterialCommunityIcons
                          name="credit-card-wireless-outline"
                          size={34}
                          color="black"
                        />
                        <Text style={styles.cardText}>Card</Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                </>
              ) : (
                <>
                  {activePaymentTypes.length > 0 &&
                  checkPaymentType(false, "CASH") ? (
                    // {/* Pay cash */}
                    <TouchableOpacity
                      style={[
                        styles.rowVeiw,
                        {
                          marginTop: 10,
                          paddingVertical: 8,
                          borderWidth: 1,
                          borderColor: primaryColor,
                          borderRadius: 5,
                        },
                      ]}
                      onPress={() => {
                        setPayType("Cash");
                        checkout("Cash");
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MaterialCommunityIcons
                          name="cash-multiple"
                          size={34}
                          color="black"
                        />
                        <Text style={styles.cardText}>Cash</Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}

                  {/* Pay on delivery with card */}
                  {activePaymentTypes.length > 0 &&
                  checkPaymentType(false, "CARD") ? (
                    <TouchableOpacity
                      style={[
                        styles.rowVeiw,
                        {
                          marginTop: 10,
                          paddingVertical: 8,
                          borderWidth: 1,
                          borderColor: primaryColor,
                          borderRadius: 5,
                        },
                      ]}
                      onPress={() => {
                        setPayType("Cash");
                        checkout("Cash");
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MaterialCommunityIcons
                          name="credit-card-wireless-outline"
                          size={34}
                          color="black"
                        />
                        <Text style={styles.cardText}>Card</Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                </>
              )}
            </View>

            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginVertical: 15,
              }}
            >
              {paymentSheetEnabled ? (
                <Text style={{ color: textColorPrimary, fontSize: 14 }}>
                  Or pay online using
                </Text>
              ) : (
                <>
                  <Text style={{ color: textColorPrimary, fontSize: 13 }}>
                    Online payment is not available now.
                  </Text>
                  <Text style={{ color: textColorPrimary, fontSize: 13 }}>
                    Try to checkout again or verify your internet connection.
                  </Text>
                </>
              )}
            </View>

            <View style={{ marginHorizontal: 10 }}>
              {/* <CardForm
                onFormComplete={(cardDetails) => {
                  setLast4Card(cardDetails.last4);
                }}
                style={{ height: Platform.OS == "android" ? 300 : 200 }}
              /> */}
              <TouchableOpacity
                style={
                  paymentSheetEnabled
                    ? styles.stripeBtn
                    : styles.stripeBtnDisabled
                }
                onPress={() => {
                  paymentSheetEnabled ? openStripePaymentSheet() : null;
                }}
              >
                <FontAwesome5 name="stripe-s" size={28} color="black" />
                <Text style={styles.cardText}>Stripe</Text>
                {loadingStripe ? (
                  <ActivityIndicator
                    size={"small"}
                    color={"#000"}
                    style={{ marginLeft: 10 }}
                  />
                ) : null}
              </TouchableOpacity>

              {/* <Button
                variant="primary"
                loading={loading}
                disabled={!paymentSheetEnabled}
                title="Checkout Enis TEST"
                onPress={openPaymentSheet}
              /> */}
            </View>

            {/* <View style={[styles.rowVeiw]}>
              <Button
                label="Confirm"
                onPress={() => {
                  !loading && pay2Stripe();
                }}
                containerStyle={{
                  marginHorizontal: 10,
                  marginTop: 40,
                  borderRadius: 10,
                  backgroundColor: primaryColor,
                  justifyContent: "center",
                  flex: 1,
                }}
                loading={loading}
                textStyle={{
                  color: "#FFF",
                  fontWeight: "bold",
                  fontSize: 22,
                }}
              />
            </View> */}
          </KeyboardAwareScrollView>
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loyaltyInput: {
    marginVertical: 10,
    backgroundColor: "#ECECEC",
    borderRadius: 99,
    paddingVertical: 10,
    paddingLeft: 10,
  },

  modal: {
    backgroundColor: "#FFF",
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: Layout.window.width - 30,
    borderRadius: 8,
  },

  confirmBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 99,
    paddingHorizontal: 30,
    backgroundColor: "rgba(20, 67, 51, 0.85)",
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "#0004",
    alignItems: "center",
    justifyContent: "center",
  },

  stripeBtnDisabled: {
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#707070",
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#707070",
  },

  stripeBtn: {
    // marginTop: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: primaryColor,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight + 10,
    // paddingHorizontal: 15,
    // width: "100%",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 55,
  },

  titleBack: {
    fontSize: 12,
    color: primaryColor,
    textAlign: "center",
    fontWeight: "bold",
    marginLeft: 10,
  },
  typeBox: {
    flexDirection: "row",
    display: "flex",
    borderRadius: 8,
  },
  addressBox: {
    marginTop: 14,
    backgroundColor: "#EEEEEE",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: secondaryColor,
    left: 6,
  },
  pickupAddress: {
    color: textColorPrimary,
    fontSize: 14,
    marginVertical: 2,
    left: 6,
  },
  deliveryAddress: {
    color: textColorPrimary,
    fontSize: 14,
    marginVertical: 2,
    left: 6,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 25,
    marginBottom: 10,
  },
  comment: {
    fontSize: 14,
    // backgroundColor: "#F3F3F3",
    // textAlignVertical: "top",
    // height: 150,
    // padding: 15,
    // fontSize: 16,
    // borderRadius: 10,
  },
  tipActiveButton: {
    borderRadius: 99,
    backgroundColor: primaryColor,
    height: 40,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  tipButton: {
    height: 40,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "90%",
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 40,
  },
  rowVeiw: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowModalContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  bottom: {
    marginTop: 25,
    backgroundColor: "#FFF",
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    paddingVertical: 25,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  normalText: {
    fontSize: 16,
    color: textColorPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(137, 139, 154, 0.4)",
    marginVertical: 16,
  },
  capTionText: {
    fontSize: 18,
    color: textColorPrimary,
    fontWeight: "bold",
  },
  modalHeader: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    marginVertical: 10,
  },
  modalTitle: {
    fontSize: 22,
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
    marginHorizontal: 10,
  },
  cardText: {
    fontSize: 16,
    color: textColorPrimary,
    fontWeight: "bold",
    marginLeft: 10,
  },
  typeButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 99,
  },
});
