import React, { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import { Dimensions, StyleSheet, Image, View, TouchableOpacity, Animated, Pressable, Platform} from "react-native";
import ScrollHeader from "../components/ScrollHeader";
import { useAnimatedRef } from "react-native-reanimated";
import { AntDesign } from "@expo/vector-icons";
import * as Location from "expo-location";


import {
  IMGIX_URL,
  // STYLE_COLOR_FONT_PRIMARY,
  // STYLE_COLOR_FONT_SECONDARY,
  STYLE_COLOR_PRIMARY,
  // STYLE_COLOR_SECONDARY,
} from "../constants/GlobalConstants";
// import useColorScheme from "../hooks/useColorScheme";
import { RootStackScreenProps } from "../types";

import {
  // getGlobalState,
  // setGlobalState,
  useGlobalState,
} from "../utils/Global";

// import Svg, { Polygon } from "react-native-svg";
import { BevietBoldText, BevietText } from "../components/Text";

import {
  Button as ButtonPaper,
  // Surface,
  RadioButton,
} from "react-native-paper";

// import SVGDelivery from "../assets/images/delivery.svg";
// import SVGPickup from "../assets/images/pickup.svg";

import Api from "../api/endpoints";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

import BottomSheetView from "../components/BottomSheetView";
import { MapView, Menu, TabHome } from "../navigation/Helpers";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import SkeletonContent from "../components/SkeletonLoader";
import ChatButton from "../components/ChatButton";

// import MaskedView from "@react-native-masked-view/masked-view";
// import SectionTabList from "react-native-tabs-section-list";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
// const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;
// const secondaryColor = STYLE_COLOR_SECONDARY;

var width = Dimensions.get("window").width; //full width
var height = Dimensions.get("window").height; //full height
interface IRegion {
  latitude: number;
  longitude: number;
}

const HEADER_MAX_HEIGHT = 450;
const HEADER_MIN_HEIGHT = 84;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

var scrollsPosition: any = [];
var disableScrollEvent: boolean = false;

export default function OrderScreen({ navigation, route }: RootStackScreenProps<"Order">) {
  
  const {
    address,
    accountUrl,
    branche_url,
  } = route.params;


  const [region, setRegion] = useState<IRegion>({
    latitude: 42.813297,
    longitude: -73.941177,
  });

  // const [address, setAddress] = useGlobalState<any>("address");
  const [loading, setLoading] = useState(true);
  const [pickUpData, setPickUpData] = useState<any>(null);
  // const colorScheme = useColorScheme();

  // const [delivery, setDelivery] = useGlobalState("delivery");
  const [delivery, setDelivery] = useState(true);
  const [menu, setMenu] = useState([]);

  const [deliveryAddress, setDeliveryAddress] = useGlobalState<any>("deliveryAddress");
  const [menuType, setMenuType] = useState<any>([]);
  const [currentType, setCurrentType] = useState<any>(null);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetTypesRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["75%"], []);
  const snapPointsTypes = useMemo(() => ["40%"], []);

  const deltaY = useRef(new Animated.Value(0)).current;
  const scrollviewRef = useAnimatedRef();
  const flatListRef = useRef<FlatList<any>>();
  const [currentItem, setCurrentItem] = useState<any>(0);

  const handleSheetChanges = useCallback((index: number) => {
    // console.log('handleSheetChanges', index);
  }, []);

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


  const getImageUrl = (data: any, key: string) => {
    // console.log("here ----> " + key);
    if (data) {
      return `${IMGIX_URL}/${data[0][key]}?ixlib=vue-2.8.4&auto=format&w=1678`;
    }
    return "";
  };

  // source={{ uri: 'http://vuaws.imgix.net/image01.jpg?fit=crop&w=' + width + '&h=' + height }}

  const getMainImageUrl = (data: any, key: string) => {
    // console.log("here ----> " + key);
    if (data) {
      return `${IMGIX_URL}/${data[0][key]}?fit=crop&w=' + ${width} + '&h=100'`;
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

  const getLocationString = () => {
    // console.log("éééé", deliveryAddress)
    if (deliveryAddress) {
      return deliveryAddress?.location;
    }
    return "Select address";
  };

  const goToDetails = async (menu: any) => {
    navigation.navigate(Menu, { itemId: menu.itemId });
  };

  const getSectionData = () => {
    let temp: any[] = [];
    menu?.items?.forEach(function (value: any) {
      let tempObject = { ...value };
      tempObject.data = tempObject.items;
      temp.push(tempObject);
    });
    return temp;
  };
  
  const HorizontalLine = ({ height = 3, borderColor = "#999", borderWidth = 0.3,}: any) => (
    <View style={{ height, borderColor, borderTopWidth: borderWidth, borderBottomWidth: borderWidth, backgroundColor: "#ddd", marginVertical: 5, }} />
  );

  const animateOpacity = deltaY.interpolate({
    inputRange: [
      0,
      HEADER_SCROLL_DISTANCE / 2 - 40,
      HEADER_SCROLL_DISTANCE / 2 - 20,
    ],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });

  const getData = async () => {
    // setLoading(true);
    let params = {
      // account_url: getGlobalState("account_url"),
      account_url: accountUrl,
    };
    const typeResponse: any = await Api.getAllByAccount(params);
    try {
      if (typeResponse) {
        if (typeResponse.data.status == 1) {
          // console.log("data of", address[0].outletName, "DONE");
          setMenuType(typeResponse.data.data);
          setCurrentType(typeResponse.data.data[0]);
          // setLoading(false);
        }
      }
    } catch (error) { }
  };

  const getMenu = async () => {
    setLoading(true);
    let params = {
      // account_name: getGlobalState("account_url"),
      // outlet_name: getGlobalState("branche_url"),
      account_name: accountUrl,
      outlet_name: branche_url,
      menu_id: currentType.menuID,
    };
    const menuResponse: any = await Api.getMenuWithItems(params);
    try {
      if (menuResponse) {
        if (menuResponse.data.status == 1) {
          // console.log("menu of", address[0].outletName, "DONE")
          setMenu(menuResponse.data.data);
          scrollsPosition = [];
          setTimeout(() => {
            setLoading(false);
          }, 500);
        }
      }
    } catch (error) { }
  };

  useEffect(() => {
    if (address) {
      setLoading(true);
      setMenu([]);
      getData();
    }; 
  }, [address]);

  useEffect(() => {
    if (currentType != null) {
      getMenu();
    }
  }, [currentType]);

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
  }, []);

  return (
    <View style={{ backgroundColor: "#fff", flex: 1 }}>
      <Animated.ScrollView
        ref={scrollviewRef}
        contentContainerStyle={{
          paddingTop: HEADER_MAX_HEIGHT,
          paddingBottom: 20,
        }}
        scrollEventThrottle={16}
        // scrollToOverflowEnabled={true}
        onMomentumScrollEnd={() => {
          disableScrollEvent = false;
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: deltaY } } }],
          {
            useNativeDriver: false,
            listener: (event: any) => {
              if (disableScrollEvent) return;
              var tmpscrollsPosition = scrollsPosition
                ?.sort((a: any, b: any) => a?.index - b?.index)
                ?.filter(
                  (item: any) =>
                    item.position <= event.nativeEvent.contentOffset.y
                );
              var index =
                tmpscrollsPosition?.[tmpscrollsPosition.length - 1]?.index || 0;
              if (index > 0) {
                setCurrentItem(index);
                flatListRef.current?.scrollToIndex({ index, animated: true });
              }
            },
          }
        )}
      >
        <ScrollHeader 
          HeaderMaxHeight={HEADER_MAX_HEIGHT}
          address={address}
          delivery={delivery}
          deliveryAddress={deliveryAddress}
          bottomSheetRef={bottomSheetRef}
          bottomSheetTypesRef={bottomSheetTypesRef}
          currentType={currentType}
          
          // Functions:
          getImageUrl={getImageUrl}
          getRestaurantName={getRestaurantName}
          getRestaurantAddress={getRestaurantAddress}
          getLocationString={getLocationString}
          setDelivery={setDelivery}
        />
       
        {loading
        ?
        // SKELETONS MENU CARD
        Array.from([1, 2, 3], x => 
          <View key={Math.random() * x} style={styles.menuCard}>
            <View>
              <SkeletonContent
                containerStyle={styles.skeleton}
                isLoading={loading}
                layout={[
                  { width: 200, height: 20, marginBottom: 10 },
                  { width: 200, height: 20, marginBottom: 10 },
                  { width: 50, height: 20, marginBottom: 6 },
                ]}
              />
            </View>
            
            <View>
              <SkeletonContent
                containerStyle={styles.skeleton}
                isLoading={loading}
                layout={[ { width: 80, height: 80, borderRadius: 10 } ]}
              />
            </View>
        </View>
        )
        :
        menu?.items.map((section: any, index: number) => {
          return (
            <View
              key={`section_${index}`}
              style={{ marginTop: 10 }}
              onLayout={(e) => { scrollsPosition.push({ position: e.nativeEvent.layout.y - 150, index }) }}
            >

              <BevietBoldText style={{ fontSize: 18, textTransform: "uppercase", color: primaryColor, alignSelf: "center" }}>
                {section.name}
              </BevietBoldText>

              {section.items.map((item: any, index: number) => {
                return (
                  <TouchableOpacity
                    key={`item_${index}`}
                    // onPress={() => console.log("i", item)}
                    onPress={() => goToDetails(item)}
                  >
                    <View
                      style={styles.menuItemContainer}
                    >
                      <View style={{ marginLeft: 15, flex: 1 }}>
                        <BevietBoldText style={{ fontSize: 15, fontWeight: "bold" }}>
                          {item.name}
                        </BevietBoldText>

                        <BevietText style={{ fontSize: 12, marginTop: 6 }}>
                          {item.description}
                        </BevietText>
                        
                        <BevietText style={{ fontSize: 16, fontWeight: "200", marginTop: 6 }}>
                          ${item.price.toFixed(2)}
                        </BevietText>
                      </View>

                      <Image 
                        style={styles.menuItemImg} 
                        source={
                          item.url 
                          ?
                          { uri: `${IMGIX_URL}/${item.url}?ixlib=vue-2.8.4&auto=format&w=1678` }
                          :
                          require("../assets/images/default-restau.jpeg")
                        }
                      />
                    </View>

                    {section.items.length != index + 1 && (
                      <View
                        style={{
                          height: 1,
                          backgroundColor: "rgba(0,0,0,0.16)",
                          marginLeft: 15,
                        }}
                      ></View>
                    )}
                  </TouchableOpacity>
                );
              })}
              {menu.items.length - 1 != index && <HorizontalLine />}
            </View>
          );
        })}
      </Animated.ScrollView>

      <Animated.View
        style={{
          backgroundColor: deltaY.interpolate({
            inputRange: [ 0, HEADER_SCROLL_DISTANCE / 2 - 40, HEADER_SCROLL_DISTANCE / 2 - 20 ],
            outputRange: ["transparent", "transparent", "#fff"],
            extrapolate: "clamp",
          }),
          position: "absolute",
          width: "100%",
          padding: 5,
          height: 120,
        }}
      >
        <View style={styles.backBtnTitleContainer}>
          <Pressable style={styles.backBtnContainer} onPress={() => navigation.navigate(TabHome)}>
            <AntDesign name="arrowleft" size={30} color="#000" />
          </Pressable>

          <Animated.Text  style={[styles.restaurantTitleContainer, { opacity: animateOpacity }]}>
            {getRestaurantName(address)}
          </Animated.Text>

          <View style={{ width: 40 }} />
        </View>

        <Animated.View style={{ opacity: animateOpacity }}>
          <FlatList
            ref={flatListRef}
            data={getSectionData()}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ backgroundColor: "#fff" }}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  {
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    alignItems: "center",
                    justifyContent: "center",
                    marginHorizontal: 5,
                  },
                  currentItem == index && {
                    borderColor:primaryColor,
                    borderBottomWidth:2
                  },
                ]}
                onPress={() => {
                  setCurrentItem(index);
                  const positon = scrollsPosition.find(
                    (scItem: any) => scItem.index == index
                  )?.position;
                  if (positon) {
                    disableScrollEvent = true;
                    scrollviewRef?.current?.scrollTo({
                      y: positon,
                      animated: true,
                    });
                  }
                }}
              >
                <BevietText
                  style={[
                    { fontSize: 14, marginVertical: 10, fontWeight: "bold" },
                    currentItem == index && { color: primaryColor },
                  ]}
                >
                  {item.name}
                </BevietText>
              </TouchableOpacity>
            )}
            horizontal={true}
          />
        </Animated.View>
      </Animated.View>
     
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
    
      <BottomSheet
        ref={bottomSheetTypesRef}
        index={-1}
        snapPoints={snapPointsTypes}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        <View style={{ paddingHorizontal: 15 }}>
          <BevietBoldText style={{ fontSize: 20 }}>All Menus</BevietBoldText>
        </View>
        <View
          style={{
            height: 1,
            backgroundColor: "rgba(0,0,0,0.16)",
            marginTop: 10,
          }}
        ></View>
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 15, marginTop: 15 }}
        >
          {menuType.map((item: any, index: number) => {
            return (
              <View key={item.menuID}>
                <TouchableOpacity
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 8,
                  }}
                  onPress={() => {
                    setCurrentType(item);
                    bottomSheetTypesRef.current?.close();
                  }}
                >
                  <RadioButton
                    value={item}
                    color={"#000"}
                    onPress={() => {
                      setCurrentType(item);
                      bottomSheetTypesRef.current?.close();
                    }}
                    status={
                      item.menuID === currentType?.menuID
                      ? "checked"
                      : "unchecked"
                    }
                  />
                  <BevietText>{item.name}</BevietText>
                </TouchableOpacity>
                {index != menuType.length - 1 && (
                  <View
                    style={{ height: 1, backgroundColor: "rgba(0,0,0,0.16)" }}
                  ></View>
                )}
              </View>
            );
          })}
        </BottomSheetScrollView>
      </BottomSheet>
      
    </View>
  );
}

const styles = StyleSheet.create({

    menuItemImg: {
      width: 106,
      height: 106,
      borderRadius: 5,
      marginRight: 15,
      marginLeft: 5,
    },

    menuItemContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      marginTop: 10,
    },

    backBtnTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    restaurantTitleContainer: {
      flex: 1,
      textAlign: "center",
      fontSize: 20,
      fontWeight: "bold",
      paddingTop: 20,
      paddingRight: 20,
    },

    backBtnContainer: {
        backgroundColor: "white",
        borderRadius: 99,
        padding: 6,
        marginTop: Platform.OS === "ios" ? 65 : 45,
        marginLeft: 20,
    },

    skeleton: {
    // flex: 1,
    width: "100%",
    paddingHorizontal: 0,
    marginTop: 20,
  },

  menuCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },


  container: {
    flex: 1,
  },

  // logo: {


  //   width: 85,
  //   height: 85,
  //   borderRadius: 333,
  //   borderWidth: 1.4,
  //   borderColor: "white",
  //   position: "absolute",
  //   bottom: 13,
  //   left: 15,
   

  // },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    height: HEADER_MAX_HEIGHT,
  },
  // headerBackground: {
  //   position: "absolute",
  //   top: 0,
  //   left: 0,
  //   right: 0,
  //   width: undefined,
  //   resizeMode: "cover",
  //   backgroundColor: "#fff",
  // },
  headerTabBar: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    width: undefined,
    height: 40,
    resizeMode: "cover",
    backgroundColor: "#fff",
    paddingHorizontal: 5,
  },
  // typeButton: {
  //   display: "flex",
  //   flexDirection: "column",
  //   alignItems: "center",
  //   borderRadius: 99,
  // },
});

