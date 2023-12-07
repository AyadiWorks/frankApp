import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View, Image, Dimensions, Pressable } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { BevietBoldText, BevietText } from "./Text";
import { Entypo } from "@expo/vector-icons";
import SVGDelivery from "../assets/images/delivery.svg";
import SVGPickup from "../assets/images/pickup.svg";

const WIDTH = Dimensions.get("window").width; //full width
// var height = Dimensions.get("window").height; //full height

// const SVG_DELIVEY = require("../assets/images/delivery.svg");
// const SVG_PICKUP = require("../assets/images/pickup.svg");

export default function ScrollHeader({
  HeaderMaxHeight,
  address,
  delivery,
  deliveryAddress,
  bottomSheetRef,
  bottomSheetTypesRef,
  currentType,

  // Functions:
  getImageUrl,
  getRestaurantName,
  getRestaurantAddress,
  getLocationString,
  setDelivery,
}) {


  return (
    <>
    <View style={[ styles.headerBackground, { flex: 1, height: HeaderMaxHeight, }, ]}>

      {/* Cover & Logo */}
      <View style={{ flex: 1, position: "relative" }}>
        <Image source={{ uri: getImageUrl(address, "photoBusiness") }} style={{ flex: 1 }} />
        
        <Svg height="80" width={WIDTH} style={{ position: "absolute", bottom: 0, }}>
          <Polygon points={`0,14 ${WIDTH}, 80 0, 80`} fill={"rgba(0,0,0,0.3)"} />
          <Polygon points={`0, 10 ${WIDTH}, 80 0, 80`} fill={"#fff"}/>
        </Svg>

        <Image source={{ uri: getImageUrl(address, "photoLogo"), }} style={styles.logo} />
      </View>

      {/* Restaurant Name & Adress */}
      <View style={{ marginBottom: -30, paddingHorizontal: 15 }}>
        <BevietBoldText style={{ fontSize: 28 }}>
          {getRestaurantName(address)}
        </BevietBoldText>
        <BevietText style={{ fontSize: 14 }}>
          {getRestaurantAddress(address)}
        </BevietText>
      </View>
      
      {/* Delivery Row */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 15,}}>
        
        <View style={{ marginTop: 30 }}>
          {delivery ? <SVGDelivery /> : <SVGPickup />}
        </View>

        <View style={{ flex: 1, marginLeft: 15, marginBottom: 10, marginTop: 55 }}>
          <BevietBoldText>
            {delivery ? "Delivery ASAP" : "Pickup ASAP"}
          </BevietBoldText>

          <BevietText style={{ color: "#020202", fontSize: 11 }}>
            {delivery
            ? 
            `Delivery in ${address[0]?.deliveryData?.preparation} mins`
            : 
            `Pickup in ${address[0]?.time} min from :`
            }
          </BevietText>

          {delivery 
          ? 
          (
          <TouchableOpacity onPress={() => { bottomSheetRef.current?.snapToIndex(0); }}>
            <BevietText style={{ color: "#144333", fontSize: 11, fontWeight: "bold", }}>
              {getLocationString()}
            </BevietText>
          </TouchableOpacity>
          ) 
          : 
          (
          <BevietText style={{ color: "#144333", fontSize: 11 }}>
            {getRestaurantAddress(address)}
          </BevietText>
          )}
        </View>

        <View style={styles.deliveryBtnsContainer}>
          <Pressable onPress={() => setDelivery(true)} style={delivery ? styles.deliveryBtnActive : styles.deliveryBtn}>
            <BevietBoldText style={{ color: delivery ? "white" : "#144333", fontSize: 12, }}>
              Delivery
            </BevietBoldText>

            <BevietText style={{ color: delivery ? "white" : "#144333", fontSize: 10 }}>
              {address[0]?.deliveryData?.preparation} mins
            </BevietText>
          </Pressable>
          
          <Pressable onPress={() => setDelivery(false)} style={delivery ? styles.deliveryBtn : styles.deliveryBtnActive}>
            <BevietBoldText style={{ color: !delivery ? "white" : "#144333", fontSize: 12 }}>
              Pickup
            </BevietBoldText>

            <BevietText style={{ color: !delivery ? "white" : "#144333", fontSize: 10 }}>
              {address[0]?.time} mins
            </BevietText>
          </Pressable>

        </View>
      </View>

      <View  style={styles.line} />

      <TouchableOpacity onPress={() => bottomSheetTypesRef.current?.snapToIndex(0)} style={{ paddingHorizontal: 15, paddingVertical: 5 }}>
        
        <View style={{ display: "flex", flexDirection: "row", alignItems: "center", }}>

          <BevietBoldText style={{ fontSize: 16, fontWeight: "bold" }}>
            Select Menu
          </BevietBoldText>
          
          <Entypo name="chevron-down" size={30} color="#000" />
        </View>

        <BevietText style={{ fontSize: 12 }}>
          {currentType?.name}
        </BevietText>

      </TouchableOpacity>
      
      <View style={styles.line2} />

    </View>
    </>
  );
}

const styles = StyleSheet.create({

  deliveryBtnsContainer: {
    flexDirection: "row",
    borderColor: "#144333",
    borderWidth: 1,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },

  line2: {
      height: 1,
      backgroundColor: "rgba(216,216,216,0.4)",
      marginTop: 10
  },

  line: {
    height: 6, 
    backgroundColor: "rgba(236,236,236,0.4)", 
    marginBottom: 10,
  },

  deliveryBtnActive:{
    alignItems: "center",
    borderRadius: 99,
    backgroundColor: "#144333",
    paddingHorizontal: 10,
    paddingVertical: 1,
  },
  
  deliveryBtn: {
    alignItems: "center",
    borderRadius: 99,
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 1,
  },

  typeButton: {
      alignItems: "center",
      borderRadius: 99,
    },

  logo: {
    width: 85,
    height: 85,
    borderRadius: 333,
    borderWidth: 1.4,
    borderColor: "white",
    position: "absolute",
    bottom: 13,
    left: 15,
  },
  
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: undefined,
    resizeMode: "cover",
    backgroundColor: "#fff",
  },
});
