import { AntDesign } from "@expo/vector-icons";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList, StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { sub } from "react-native-reanimated";
import SafeAreaView from "react-native-safe-area-view";
import Colors from "../constants/Colors";
import {
  STYLE_COLOR_FONT_PRIMARY,
  STYLE_COLOR_FONT_SECONDARY, STYLE_COLOR_PRIMARY
} from "../constants/GlobalConstants";
import useColorScheme from "../hooks/useColorScheme";
import { RootStackScreenProps } from "../types";
import { DATE2DATE } from "../utils/Helpers";
import SkeletonContent from "../components/SkeletonLoader";


const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;

export default function OrderReceiptScreen({ navigation, route }: RootStackScreenProps<"OrderReceipt">) {
  
  const colorScheme = useColorScheme();
  const order = route.params?.order;
  const server = route.params?.server;

  const [loading, setLoading] = useState(true);
  const [newOrder, setNewOrder] = useState<any[]>([]);

  useEffect(() => {
    if(order) {
      let orderFiltred = order.items.filter((item: any) => item.price !== 0);
      setNewOrder(orderFiltred);
      setTimeout(() => {
        setLoading(false);
      }, 200);
    }
  }, [order]);
  
  return (
    <View style={[ styles.container, { backgroundColor: Colors[colorScheme].background , marginVertical:10 }]}>

      <View style={[ styles.backButton, {marginVertical:8}]}>
        <TouchableOpacity  onPress={() => { navigation.goBack() }}>
          <AntDesign name="arrowleft" size={30} color="#000" />
        </TouchableOpacity>

        <Text style={{ fontSize: 34, fontFamily: "beviet-bold" , marginVertical:25}}>Order Receipt</Text>
      </View>

      <View style={{ marginTop: 40, paddingHorizontal: 15, marginVertical: 29 }}>
        <Text style={{ fontSize: 18, fontFamily: "beviet-bold" }}>{order.restaurantName}</Text>
        <Text style={{ fontSize: 14, fontFamily: "beviet-regular", color: "rgb(55, 57, 60)" }}>{DATE2DATE(order.placed, true)}</Text>
      </View>

      <View style={{ backgroundColor: '000000', height: 2 }}/>

      {loading
      ?
      <View style={{ flex:1 }}>

        <View style={{ flex: 3 }}>
          {Array(6).fill("").map( (x: any, i: any) => (
            <>
            <View key={Math.random() * i} style={styles.orderSkeletonLine}>
              <View>
                <SkeletonContent
                  containerStyle={styles.skeleton}
                  isLoading={loading}
                  layout={[
                    { width: 150, height: 20, marginBottom: 10 },
                  ]}
                />
              </View>

              <View>
                <SkeletonContent
                  containerStyle={styles.skeleton}
                  isLoading={loading}
                  layout={[
                    { width: 80, height: 20, marginBottom: 10 },
                  ]}
                />
              </View>

            </View>
            <View style={[styles.line, { marginBottom: 10, }]} />
            </>
          ))}
        </View>

        <View style={{ flex: 1 }}>
          {Array(4).fill("").map( (x: any, i: any) => (
              <>
              <View key={Math.random() * i * 9} style={styles.orderSkeletonLine}>
                <View>
                  <SkeletonContent
                    containerStyle={styles.skeleton}
                    isLoading={loading}
                    layout={[
                      { width: 150, height: 20, marginBottom: 10 },
                    ]}
                  />
                </View>

                <View>
                  <SkeletonContent
                    containerStyle={styles.skeleton}
                    isLoading={loading}
                    layout={[
                      { width: 80, height: 20, marginBottom: 10 },
                    ]}
                  />
                </View>

              </View>
              </>
            ))}
        </View>
      </View>
      :
      <>
      <FlatList
        keyExtractor={(item, index) => (index * Math.random()).toString()}
        // data={order?.items}
        data={newOrder}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        ListFooterComponent={<View style={{ flex: 1, width: 8 }} />}
        renderItem={({ item }) => (
          <View>
            <View style={{ flexDirection: 'row', paddingVertical: 12, padding: 15, backgroundColor: item.voided? "red" : ""}}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', marginRight: 20, fontFamily: "beviet-regular", }}>{item.quantity} x</Text>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 14, fontFamily: "beviet-regular", }}>{item.name}</Text>
                  {item.specialInstructions.map((spec: any) => (
                    spec.subtitles.map((sub: any, index: any) => (
                      <Text style={{ fontSize: 14, fontFamily: "beviet-regular", }} key={index}>{sub.quantity} {sub.title} (${sub.price.toFixed(2)})</Text>
                    ))
                  ))}
                </View>
                <Text style={{ fontSize: 14, fontFamily: "beviet-regular", }}>$ {item.price / 100}</Text>
              </View>
            </View>
            
            <View style={styles.line} />
            
          </View>
        )}
      />
      <View style={{ backgroundColor: "#FFF", marginTop: 10, borderRadius: 5, paddingHorizontal: 15, paddingBottom: 60 }}>
        <View style={{ marginVertical: 2, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: "beviet-regular", fontSize: 14 }}>SubTotal</Text>
          <Text style={{ fontFamily: "beviet-regular", fontSize: 14 }}>$ {(order?.subtotal / 100).toFixed(2)}</Text>
        </View>
        <View style={{ marginVertical: 2, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: "beviet-regular", fontSize: 14 }}>Gratuity</Text>
          <Text style={{ fontFamily: "beviet-regular", fontSize: 14 }}>$ 0.00</Text>
        </View>
        <View style={{ marginVertical: 2, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: "beviet-regular", fontSize: 14 }}>Tips</Text>
          <Text style={{ fontFamily: "beviet-regular", fontSize: 14 }}>$ {(order.tip / 100).toFixed(2)}</Text>
        </View>
        <View style={{ marginVertical: 2, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: "beviet-bold", fontSize: 14 }}>Tax & Fees</Text>
          <Text style={{ fontFamily: "beviet-regular", fontSize: 14 }}>$ {(order?.tax / 100).toFixed(2)}</Text>
        </View>
        <View style={{ marginVertical: 2, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: "beviet-regular", fontSize: 14 }}>Total</Text>
          <Text style={{ fontFamily: "beviet-regular", fontSize: 14 }}>$ {(order?.total/100).toFixed(2)}</Text>
        </View>
      </View>
      </>
      }

    </View>
  );
}

const styles = StyleSheet.create({

  skeleton: {
    // flex: 1,
    width: "100%",
    paddingHorizontal: 0,
    // marginTop: 20,
  },

  orderSkeletonLine: {
    marginHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  line: { 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    height: 2, 
    marginHorizontal: 15,
  },

  container: {
    flex: 1,
  },
  backButton: {
    left: 15,
    top: Constants.statusBarHeight + 10,
  },
});
