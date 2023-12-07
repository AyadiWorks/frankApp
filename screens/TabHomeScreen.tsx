import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Platform,
} from "react-native";

import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useIsFocused } from "@react-navigation/native";
import { create } from "apisauce";
import { Video } from "expo-av";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import SafeAreaView from "react-native-safe-area-view";
import Carousel, { Pagination } from "react-native-snap-carousel";
import GestureRecognizer from "react-native-swipe-gestures";
// import SvgPlaceholder from "../assets/images/placeholder.svg";
import ChatButton from "../components/ChatButton";
import BottomSheetView from "../components/BottomSheetView";
import { BevietBoldText, BevietText } from "../components/Text";
import Colors from "../constants/Colors";
import SkeletonContent from "../components/SkeletonLoader";

import {
  ACCOUNT_URL_1,
  ACCOUNT_URL_2,
  ACCOUNT_URL_3,
  ACCOUNT_URL_4,
  BRANCHE_URL_1,
  BRANCHE_URL_2,
  BRANCHE_URL_3,
  BRANCHE_URL_4,
  IMGIX_URL,
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY,
  STYLE_COLOR_PRIMARY,
  STYLE_COLOR_SECONDARY,
} from "../constants/GlobalConstants";
// import useColorScheme from "../hooks/useColorScheme";
import { MapView, Order } from "../navigation/Helpers";
import { RootTabScreenProps } from "../types";
import { setGlobalState, useGlobalState } from "../utils/Global";
import Api from "../api/endpoints";
// import {
//   green100,
//   white,
// } from "react-native-paper/lib/typescript/styles/colors";
const API_INSTAGRAM = "https://stories.bot.space/api/user";

const instagramClient = create({
  baseURL: API_INSTAGRAM,
});

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;
const secondaryColor = STYLE_COLOR_SECONDARY;

var width = Dimensions.get("window").width; //full width
var height = Dimensions.get("window").height; //full height
interface IRegion {
  latitude: number;
  longitude: number;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function TabHomeScreen({
  navigation,
}: RootTabScreenProps<"TabHome">) {
  const [loading, setLoading] = useState<boolean>(false);
  // const colorScheme = useColorScheme();
  // const isFocused = useIsFocused();
  const [deliveryAddress, setDeliveryAddress] =
    useGlobalState<any>("deliveryAddress");
  const bottomSheetRef = useRef<BottomSheet>(null);
  const _sliderRef = useRef(null);
  const _videoRef = useRef(null);
  // const [address, setAddress] = useGlobalState<any>("address");

  // Restaurants DATA
  const [address1, setAddress1] = useGlobalState<any>("address1");
  const [address2, setAddress2] = useGlobalState<any>("address2");
  const [address3, setAddress3] = useGlobalState<any>("address3");
  const [address4, setAddress4] = useGlobalState<any>("address4");

  // Instagram
  const [stories, setStories] = useState<any>([]);
  const [storyModal, setStoryModal] = useState<any>(false);

  const [region, setRegion] = useState<IRegion>({
    latitude: 42.813297,
    longitude: -73.941177,
  });

  const [content, setContent] = useState<any>(null);
  // for get the duration
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  const [end, setEnd] = useState(0);
  // current is for get the current content is now playing
  const [current, setCurrent] = useState(0);
  // if load true then start the animation of the bars at the top
  const [load, setLoad] = useState(false);
  // progress is the animation value of the bars content playing the current state
  const progress = useRef(new Animated.Value(0)).current;

  const carouselItems = [
    {
      image: require("../assets/images/frank/carousel-home/1.jpg"),
    },
    {
      image: require("../assets/images/frank/carousel-home/2.jpg"),
    },
    {
      image: require("../assets/images/frank/carousel-home/3.jpg"),
    },
    {
      image: require("../assets/images/frank/carousel-home/4.jpg"),
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  // Notifications:
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const saveDeviceToken = async (token: string) => {
    let params = {
      deviceToken: token,
    };
    const response: any = await Api.setDeviceToken(params);
  };

  const getLocationString = () => {
    if (deliveryAddress) {
      return deliveryAddress.location.split(",")[0];
    }
    return "Select Address";
  };

  const handleSheetChanges = useCallback((index: number) => {
    // console.log('handleSheetChanges', index);
  }, []);

  const snapPoints = useMemo(() => ["75%"], []);

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

  const _renderItem = ({ item, index }: any) => {
    return (
      <View
        style={{
          borderRadius: 8,
        }}
      >
        <Image
          source={item.image}
          style={{ width: width - 40, height: 160, borderRadius: 8 }}
        />
      </View>
    );
  };

  const getImageUrl = (data: any) => {
    if (data) {
      return `${IMGIX_URL}/${data[0].photoBusiness}?ixlib=vue-2.8.4&auto=format&w=1678`;
    }
    return "";
  };

  const getRestaurantName = (data: any) => {
    if (data) {
      return data[0].outletName;
    }
    return "";
  };

  const getRestaurantAddress = (data: any) => {
    if (data) {
      return data[0].address;
    }
    return "";
  };

  const getRestaurantTime = (data: any) => {
    if (data) {
      let info = data[0];
      if (info.pickup_open && info.delivery_open) {
        return "Open";
      } else if (info.pickup_open && !info.delivery_open) {
        return "Open for pickup only";
      } else if (info.pickup_open && !info.delivery_open) {
        return "Open for delivery only";
      } else {
        return "Close";
      }
    }
    return "";
  };

  const getInstagramData = async () => {
    let params = {
      shopOrigin: "kattoozllc.myshopify.com",
    };

    instagramClient.get("", params).then((response: any) => {
      if (response) {
        let temp = [];

        let temp_10: any[] = [];
        response.data.customStories.forEach((element: any) => {
          let at = {
            type: "photo",
            src: element.image,
          };
          temp_10.push(at);
        });
        let get10Percent = {
          title: response.data.customStory.title,
          cover_media: {
            url: response.data.customStory.image,
          },
          items: temp_10,
        };

        temp.push(get10Percent);

        let today = {
          title: "Today",
          cover_media: {
            url: response.data.ig.profile_pic_url,
          },
          items: response.data.stories,
        };
        temp.push(today);

        setStories([...temp, ...response.data.highlights]);
      }
    });
  };

  const start = (n: number) => {
    // checking if the content type is video or not
    if (content[current].type == "video") {
      // type video
      if (load) {
        Animated.timing(progress, {
          toValue: 1,
          duration: n,
          useNativeDriver: false,
        }).start(({ finished }) => {
          if (finished) {
            next();
          }
        });
      }
    } else {
      // type image
      Animated.timing(progress, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          next();
        }
      });
    }
  };

  const play = () => {
    start(end);
  };

  const next = () => {
    // check if the next content is not empty
    if (current !== content.length - 1) {
      let data = [...content];
      data[current].finish = 1;
      setContent(data);
      setCurrent(current + 1);
      progress.setValue(0);
      setLoad(false);
    } else {
      // the next content is empty
      close();
    }
  };

  const previous = () => {
    // checking if the previous content is not empty
    if (current - 1 >= 0) {
      let data = [...content];
      data[current].finish = 0;
      setContent(data);
      setCurrent(current - 1);
      progress.setValue(0);
      setLoad(false);
    } else {
      // the previous content is empty
      close();
    }
  };

  const close = () => {
    progress.setValue(0);
    setLoad(false);
    setStoryModal(false);
  };

  const registerForPushNotificationsAsync = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        // alert('Failed to get push token for push notification!');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("My TOken Device", token);
      saveDeviceToken(token);
    } else {
      console.log("Must use physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  };

  // Get Location & Instagram Data
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

    getInstagramData();
  }, []);

  // Notifications
  useEffect(() => {
    console.log("NOTIFS");
    registerForPushNotificationsAsync();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        // setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        // console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: "#eee",
          // backgroundColor: Colors[colorScheme].background
        },
      ]}
    >
      <ScrollView contentContainerStyle={{ padding: 15 }}>
        {/* Delivering To */}
        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BevietText style={{ fontSize: 13 }}>Delivering to</BevietText>

          <TouchableOpacity
            onPress={() => {
              bottomSheetRef.current?.snapToIndex(0);
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 10,
                marginBottom: 10,
              }}
            >
              <BevietBoldText style={styles.deliveryAddress}>
                {getLocationString()}
              </BevietBoldText>

              <AntDesign
                style={{ marginLeft: 4, marginTop: 3 }}
                name="down"
                size={14}
                color={"#000"}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Instagram Card : Keep up with the gram */}
        <View style={styles.cardInsta}>
          <View style={{ paddingLeft: 15, paddingTop: 10 }}>
            <Text style={styles.keepUpTxt}>Keep Up With The Gram ...</Text>
          </View>

          <SkeletonContent
            containerStyle={styles.skeletonInstaView}
            isLoading={!stories.length}
            animationType="pulse"
            layout={[
              {
                key: "someId",
                borderRadius: 50,
                width: 70,
                height: 70,
                padding: 3,
                marginLeft: 5,
                marginRight: 15,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 25,
              },
              {
                key: "someOtherId",
                borderRadius: 50,
                width: 70,
                height: 70,
                padding: 3,
                marginRight: 15,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 25,
              },
              {
                key: "someId2",
                borderRadius: 50,
                width: 70,
                height: 70,
                padding: 3,
                marginRight: 15,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 25,
              },
              {
                key: "someOtherId3",
                borderRadius: 50,
                width: 70,
                height: 70,
                padding: 3,
                marginRight: 15,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 25,
              },
              {
                key: "someOtherId4",
                borderRadius: 50,
                width: 70,
                height: 70,
                padding: 3,
                marginRight: 15,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 25,
              },
            ]}
          >
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              data={stories}
              horizontal
              style={{ marginTop: 25 }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              ListFooterComponent={<View style={{ flex: 1, width: 8 }} />}
              renderItem={({ item, index }) => (
                <View style={{ alignItems: "center", paddingHorizontal: 5 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setCurrent(0);
                      setContent(item.items);
                      setName(item.title);
                      setAvatar(item.cover_media.url);
                      setStoryModal(true);
                    }}
                    style={{
                      borderWidth: 1,
                      borderRadius: 50,
                      borderColor: "rgba(0, 0, 0, 0.85)",
                      padding: 3,
                      marginRight: 5,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      source={{ uri: item.cover_media.url }}
                      style={{ width: 60, height: 60, borderRadius: 30 }}
                    ></Image>
                  </TouchableOpacity>
                  <BevietText style={{ marginTop: 5 }}>{item.title}</BevietText>
                </View>
              )}
            />
          </SkeletonContent>
        </View>

        {/* Carousel */}
        <Carousel
          ref={_sliderRef}
          data={carouselItems}
          renderItem={_renderItem}
          sliderWidth={width - 15}
          itemWidth={width - 40}
          hasParallaxImages={true}
          firstItem={0}
          inactiveSlideScale={0.94}
          inactiveSlideOpacity={0.7}
          containerCustomStyle={{
            marginTop: 20,
          }}
          contentContainerCustomStyle={{
            paddingLeft: 0,
          }}
          loop={true}
          loopClonesPerSide={2}
          autoplay={true}
          autoplayDelay={500}
          autoplayInterval={3000}
          onSnapToItem={(index) => setActiveIndex(index)}
        />
        {
          <Pagination
            dotsLength={carouselItems.length}
            activeDotIndex={activeIndex}
            containerStyle={{
              paddingVertical: 5,
            }}
            dotColor={"#2F2F37"}
            dotStyle={{
              width: 12,
              height: 7,
              borderRadius: 6,
              marginVertical: 15,
            }}
            inactiveDotColor={"#DEDEE3"}
            inactiveDotOpacity={1}
            inactiveDotScale={0.6}
          />
        }

        {/* Restaurants CARD */}
        <View style={styles.restaurantsCard}>
          <Text style={styles.restaurantsTitle}>La Famiglia</Text>

          {/* Restaurant 1 */}
          <TouchableOpacity
            onPress={() => {
              setGlobalState("address", address1);
              setGlobalState("account_url", ACCOUNT_URL_1);
              setGlobalState("branche_url", BRANCHE_URL_1);
              // // navigation.navigate(Order);
              navigation.navigate(Order, {
                address: address1,
                accountUrl: ACCOUNT_URL_1,
                branche_url: BRANCHE_URL_1,
              });
            }}
          >
            <ImageBackground
              source={{ uri: getImageUrl(address1) }}
              imageStyle={{ borderRadius: 8 }}
              style={[styles.image, { marginTop: 20 }]}
            >
              <View
                style={[
                  styles.restaurantStatusWrapper,
                  {
                    alignItems: "center",
                    backgroundColor: "#FFF",
                    borderRadius: 100,
                    paddingVertical: 8,
                    paddingHorizontal: 15,
                  },
                ]}
              >
                <BevietText style={{ fontSize: 12, fontWeight: "500" }}>
                  {address1[0].delivery_open && `Accepting Delivery`}
                  {address1[0].delivery_open == false &&
                    address1[0].pickup_open == true &&
                    `Accepting Pickup`}
                  {getRestaurantTime(address1) == "Close" && `Currently Closed`}
                </BevietText>
              </View>
            </ImageBackground>

            <View style={styles.rowView}>
              <View style={{ marginTop: 15 }}>
                <BevietBoldText style={styles.restaurantName}>
                  {getRestaurantName(address1)}
                </BevietBoldText>

                <BevietText style={styles.restaurantAddress}>
                  {getRestaurantAddress(address1)}
                </BevietText>

                <BevietText style={styles.restaurantTime}>
                  {address1[0].delivery_open &&
                    `${address1[0]?.deliveryData?.preparation} min. Free Delivery`}
                  {address1[0].delivery_open == false &&
                    address1[0].pickup_open == true &&
                    `${address1[0]?.time} min. Free Pickup`}
                </BevietText>
              </View>

              <BevietText style={styles.restaurantAddress}></BevietText>
            </View>
          </TouchableOpacity>

          <View style={styles.line} />

          {/* Restaurant 2 */}
          <TouchableOpacity
            onPress={() => {
              setGlobalState("address", address2);
              setGlobalState("account_url", ACCOUNT_URL_2);
              setGlobalState("branche_url", BRANCHE_URL_2);
              // navigation.navigate(Order);

              navigation.navigate(Order, {
                address: address2,
                accountUrl: ACCOUNT_URL_2,
                branche_url: BRANCHE_URL_2,
              });
            }}
          >
            <ImageBackground
              source={{ uri: getImageUrl(address2) }}
              imageStyle={{ borderRadius: 8 }}
              style={[styles.image, { marginTop: 20 }]}
            >
              <View
                style={[
                  styles.restaurantStatusWrapper,
                  {
                    alignItems: "center",
                    backgroundColor: "#FFF",
                    borderRadius: 100,
                    paddingVertical: 8,
                    paddingHorizontal: 15,
                  },
                ]}
              >
                <BevietText style={{ fontSize: 12, fontWeight: "500" }}>
                  {address2[0].delivery_open && `Accepting Delivery`}
                  {address2[0].delivery_open == false &&
                    address2[0].pickup_open == true &&
                    `Accepting Pickup`}
                  {getRestaurantTime(address2) == "Close" && `Currently Closed`}
                </BevietText>
              </View>
            </ImageBackground>

            <View style={styles.rowView}>
              <View style={{ marginTop: 15 }}>
                <BevietBoldText style={styles.restaurantName}>
                  {getRestaurantName(address2)}
                </BevietBoldText>
                <BevietText style={styles.restaurantAddress}>
                  {getRestaurantAddress(address2)}
                </BevietText>
                <BevietText style={styles.restaurantTime}>
                  {address2[0].delivery_open &&
                    `${address2[0]?.deliveryData?.preparation} min. Free Delivery`}
                  {address2[0].delivery_open == false &&
                    address2[0].pickup_open == true &&
                    `${address2[0]?.time} min. Free Pickup`}
                </BevietText>
              </View>
              <BevietText style={styles.restaurantAddress}></BevietText>
            </View>
          </TouchableOpacity>

          <View style={styles.line} />

          {/* Restaurant 3 */}
          <TouchableOpacity
            onPress={() => {
              setGlobalState("address", address3);
              setGlobalState("account_url", ACCOUNT_URL_3);
              setGlobalState("branche_url", BRANCHE_URL_3);
              // navigation.navigate(Order);
              navigation.navigate(Order, {
                address: address3,
                accountUrl: ACCOUNT_URL_3,
                branche_url: BRANCHE_URL_3,
              });
            }}
          >
            <ImageBackground
              source={{ uri: getImageUrl(address3) }}
              imageStyle={{ borderRadius: 8 }}
              style={[styles.image, { marginTop: 20 }]}
            >
              <View
                style={[
                  styles.restaurantStatusWrapper,
                  {
                    alignItems: "center",
                    backgroundColor: "#FFF",
                    borderRadius: 100,
                    paddingVertical: 8,
                    paddingHorizontal: 15,
                  },
                ]}
              >
                <BevietText style={{ fontSize: 12, fontWeight: "500" }}>
                  {address3[0].delivery_open && `Accepting Delivery`}
                  {address3[0].delivery_open == false &&
                    address3[0].pickup_open == true &&
                    `Accepting Pickup`}
                  {getRestaurantTime(address3) == "Close" && `Currently Closed`}
                </BevietText>
              </View>
            </ImageBackground>

            <View style={styles.rowView}>
              <View style={{ marginTop: 15 }}>
                <BevietBoldText style={styles.restaurantName}>
                  {getRestaurantName(address3)}
                </BevietBoldText>
                <BevietText style={styles.restaurantAddress}>
                  {getRestaurantAddress(address3)}
                </BevietText>
                <BevietText style={styles.restaurantTime}>
                  {address3[0].delivery_open &&
                    `${address3[0]?.deliveryData?.preparation} min. Free Delivery`}
                  {address3[0].delivery_open == false &&
                    address3[0].pickup_open == true &&
                    `${address3[0]?.time} min. Free Pickup`}
                </BevietText>
              </View>
              <BevietText style={styles.restaurantAddress}></BevietText>
            </View>
          </TouchableOpacity>

          <View style={styles.line} />

          <TouchableOpacity
            onPress={() => {
              setGlobalState("address", address4);
              setGlobalState("account_url", ACCOUNT_URL_4);
              setGlobalState("branche_url", BRANCHE_URL_4);
              // navigation.navigate(Order);
              navigation.navigate(Order, {
                address: address4,
                accountUrl: ACCOUNT_URL_4,
                branche_url: BRANCHE_URL_4,
              });
            }}
          >
            {/* <BevietText style={{ fontSize: 12, fontWeight: "500" }}>
    {JSON.stringify(address4)}
  </BevietText> */}

            <ImageBackground
              source={{ uri: getImageUrl(address4) }}
              imageStyle={{ borderRadius: 8 }}
              style={[styles.image, { marginTop: 20 }]}
            >
              <View
                style={[
                  styles.restaurantStatusWrapper,
                  {
                    alignItems: "center",
                    backgroundColor: "#FFF",
                    borderRadius: 100,
                    paddingVertical: 8,
                    paddingHorizontal: 15,
                  },
                ]}
              >
                <BevietText style={{ fontSize: 12, fontWeight: "500" }}>
                  {address4[0].delivery_open && `Accepting Delivery`}
                  {address4[0].delivery_open == false &&
                    address4[0].pickup_open == true &&
                    `Accepting Pickup`}
                  {getRestaurantTime(address4) == "Close" && `Currently Closed`}
                </BevietText>
              </View>
            </ImageBackground>

            <View style={styles.rowView}>
              <View style={{ marginTop: 15 }}>
                <BevietBoldText style={styles.restaurantName}>
                  {getRestaurantName(address4)}
                </BevietBoldText>
                <BevietText style={styles.restaurantAddress}>
                  {getRestaurantAddress(address4)}
                </BevietText>
                <BevietText style={styles.restaurantTime}>
                  {address4[0].delivery_open &&
                    `${address4[0]?.deliveryData?.preparation} min. Free Delivery`}
                  {address4[0].delivery_open == false &&
                    address4[0].pickup_open == true &&
                    `${address4[0]?.time} min. Free Pickup`}
                </BevietText>
              </View>
              <BevietText style={styles.restaurantAddress}></BevietText>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ChatButton />

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
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
        />
      </BottomSheet>

      {/* Instagram stories modal */}
      <Modal animationType="fade" transparent={false} visible={storyModal}>
        <GestureRecognizer
          onSwipeDown={(state) => close()}
          config={{
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 80,
          }}
          style={{
            flex: 1,
            backgroundColor: "black",
          }}
        >
          <View style={styles.containerModal}>
            <View style={styles.backgroundContainer}>
              {content &&
                (content[current].type == "video" ? (
                  <Video
                    source={{
                      uri: content[current].src,
                    }}
                    ref={_videoRef}
                    rate={1.0}
                    volume={1.0}
                    resizeMode="contain"
                    shouldPlay={true}
                    positionMillis={0}
                    onReadyForDisplay={play}
                    onPlaybackStatusUpdate={(AVPlaybackStatus) => {
                      setLoad(AVPlaybackStatus.isLoaded);
                      setEnd(AVPlaybackStatus.durationMillis);
                    }}
                    style={{ height: height, width: width }}
                  />
                ) : (
                  <Image
                    onLoadEnd={() => {
                      setLoad(true);
                      progress.setValue(0);
                      play();
                    }}
                    source={{ uri: content[current].src }}
                    style={{
                      width: width,
                      height: height,
                      resizeMode: "cover",
                    }}
                  />
                ))}
              {!load && (
                <View
                  style={{
                    position: "absolute",
                    alignSelf: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <ActivityIndicator size="large" color={"white"} />
                </View>
              )}
            </View>
            {content && (
              <View style={{ flexDirection: "column", flex: 1 }}>
                <LinearGradient
                  colors={["rgba(0,0,0,1)", "transparent"]}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    height: 100,
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    paddingHorizontal: 10,
                  }}
                >
                  {content.map((index, key) => {
                    return (
                      // THE BACKGROUND
                      <View
                        key={key}
                        style={{
                          height: 2,
                          flex: 1,
                          flexDirection: "row",
                          backgroundColor: "rgba(117, 117, 117, 0.5)",
                          marginHorizontal: 2,
                          marginTop: Constants.statusBarHeight,
                        }}
                      >
                        {/* THE ANIMATION OF THE BAR*/}
                        <Animated.View
                          style={{
                            flex:
                              current == key ? progress : content[key].finish,
                            height: 2,
                            backgroundColor: "rgba(255, 255, 255, 1)",
                          }}
                        ></Animated.View>
                      </View>
                    );
                  })}
                </View>

                <View
                  style={{
                    height: 50,
                    flexDirection: "row",

                    justifyContent: "space-between",
                    paddingHorizontal: 15,
                  }}
                >
                  {/* THE AVATAR AND USERNAME  */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 10,
                    }}
                  >
                    <Image
                      style={{ height: 30, width: 30, borderRadius: 25 }}
                      source={{
                        uri: avatar,
                      }}
                    />
                    <BevietBoldText
                      style={{
                        color: "white",
                        paddingLeft: 10,
                      }}
                    >
                      {name}
                    </BevietBoldText>
                  </View>
                  {/* END OF THE AVATAR AND USERNAME */}
                  {/* THE CLOSE BUTTON */}
                  <TouchableOpacity
                    onPress={() => {
                      close();
                    }}
                  >
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",

                        height: 50,
                        paddingHorizontal: 15,
                        marginTop: 10,
                      }}
                    >
                      <Ionicons name="ios-close" size={28} color="white" />
                    </View>
                  </TouchableOpacity>
                  {/* END OF CLOSE BUTTON */}
                </View>

                <View style={{ flex: 1, flexDirection: "row" }}>
                  <TouchableWithoutFeedback onPress={() => previous()}>
                    <View style={{ flex: 1 }}></View>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback onPress={() => next()}>
                    <View style={{ flex: 1 }}></View>
                  </TouchableWithoutFeedback>
                </View>
              </View>
            )}
          </View>
        </GestureRecognizer>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  restaurantsTitle: {
    fontSize: 22,
    color: primaryColor,
    fontFamily: "pacifico",
    marginTop: 0,
    marginBottom: 5,
  },

  restaurantsCard: {
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
  },

  skeletonInstaView: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    paddingBottom: 20,
    shadowColor: "#000",
  },

  keepUpTxt: {
    fontSize: 20,
    color: primaryColor,
    fontFamily: "pacifico",
  },

  cardInsta: {
    backgroundColor: "#fff",
    borderRadius: 5,
    width: "100%",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
  },

  line: {
    height: 1,
    marginRight: -15,
    backgroundColor: "#707070",
    marginTop: 15,
    opacity: 0.2,
  },

  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: secondaryColor,
    left: 6,
  },
  deliveryAddress: {
    color: "#000",
    fontSize: 15,
    marginVertical: 2,
    fontWeight: "500",
  },
  image: {
    height: 169,
    width: width - 60,
  },
  rowView: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  restaurantName: {
    color: "#020202",
    fontSize: 18,
  },
  restaurantStatusWrapper: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  restaurantStatusText: {
    color: "white",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  textOpen: {
    backgroundColor: "#41a317bb",
  },
  textClose: {
    backgroundColor: "#ff0000bb",
  },
  restaurantAddress: {
    color: "#020202",
    fontSize: 12,
  },
  restaurantTime: {
    color: "#020202",
    fontSize: 12,
  },
  containerModal: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
