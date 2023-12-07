import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import SafeAreaView from "react-native-safe-area-view";
import { useToast } from "react-native-toast-notifications";
import Api from '../api/endpoints';
import Button from "../components/Button";
import Colors from "../constants/Colors";
import { STYLE_COLOR_FONT_PRIMARY, STYLE_COLOR_FONT_SECONDARY, STYLE_COLOR_PRIMARY } from '../constants/GlobalConstants';
import useColorScheme from "../hooks/useColorScheme";
import { Root, WebView } from '../navigation/Helpers';
import { RootStackScreenProps } from "../types";
import { setGlobalState } from '../utils/Global';
import { STORAGE_USER, storeData } from '../utils/Helpers';

const textColorPrimary = STYLE_COLOR_FONT_PRIMARY;
const textColorSecondary = STYLE_COLOR_FONT_SECONDARY;
const primaryColor = STYLE_COLOR_PRIMARY;
export default function RegisterScreen({ navigation, route }: RootStackScreenProps<"Register">) {

  // State:
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const colorScheme = useColorScheme();
  const country = route.params?.country;
  const countryCode = route.params?.countryCode;
  const phone = route.params?.phone;
  
  const verifEmail = (email : string) => {
    let validRegex: any = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if(email.match(validRegex)) {
      return true;
    } 
    return false;
  };
  
  const register = async () => {

    if(name.length < 2) {
      toast.show("Please type a valid USERNAME", {
        type: 'danger',
        placement: "top",
      });
    } 
    else if(!verifEmail(email)) {
      toast.show("Please provide a valid EMAIL ADDRESS", {
        type: 'danger',
        placement: "top",
      });
    }
    else {
      setLoading(true);

      let body = {
        phone: phone,
        email: email,
        fullName: name,
        countryCode: countryCode,
        role: "Customer",
        country: country,
      };

      let response:any = await Api.register(body);
      try {
        if (response.data.status == 1) {
          await storeData(STORAGE_USER, JSON.stringify(response.data.data))
          setGlobalState("token", response.data.data.token)
          navigation.replace(Root)
        } else {
          toast.show(response.data.message, {
            type: 'danger',
            placement: "top",
          })
        }
  
      } catch (error) {
        toast.show(response.data.message, {
          type: 'danger',
          placement: "top",
        })
      }
      setLoading(false);
    };

  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      
      <View style={{ flex: 3, paddingTop: 50, paddingHorizontal: 20,}}>
        <ScrollView>
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <Image
              source={require('../assets/images/logos.png')}
              style={{ width: 210, height: 90, }}
              resizeMode='contain'
            />
          </View>

          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: textColorPrimary }}>Sign Up</Text>
            {/* <Text style={{ fontSize: 14, fontWeight: 'bold', color: textColorPrimary, marginTop: 5 }}>We need your details</Text> */}
          </View>

          <View style={{ paddingTop: 20,}}>
              <TextInput
                placeholder="Full Name"
                onChangeText={(text: string) => { setName(text) }}
                value={name}
                placeholderTextColor={"#707070"}
                style={styles.input}
              />
              
              <TextInput
                placeholder="Email"
                onChangeText={(text: string) => { setEmail(text) }}
                value={email}
                placeholderTextColor={"#707070"}
                style={styles.input}
              />
              
              <View style={{ marginTop: 20 }}>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: textColorPrimary }}>By signing up, you agree to our </Text>
                  <TouchableOpacity onPress={() => { navigation.navigate(WebView, { url: "https://tradersexpressdeli.com/terms-of-use-agreement/", }) }}><Text style={{ fontSize: 12, color: textColorPrimary, textDecorationLine: 'underline' }}>terms of service</Text></TouchableOpacity>
                  <Text style={{ fontSize: 12, color: textColorPrimary }}>.</Text>
                </View>
              
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Text style={{ fontSize: 12, color: textColorPrimary }}>and our</Text>
                  <TouchableOpacity onPress={() => { navigation.navigate(WebView, { url: "https://tradersexpressdeli.com/privacy-policy/", }) }}><Text style={{ fontSize: 12, color: textColorPrimary, textDecorationLine: 'underline' }}>privacy policy</Text></TouchableOpacity>
                  <Text style={{ fontSize: 12, color: textColorPrimary }}>.</Text>
                </View>
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 20, }}>
        
          <Button label="Register" onPress={() => !loading ? register() : null}
            loading={loading}
            containerStyle={styles.greenBtn}
            textStyle={{ color: "#FFF", fontWeight: 'bold' }}
          />

          <Button label="Back" onPress={() => navigation.goBack()}
            containerStyle={styles.whiteBtn}
            textStyle={{ color: primaryColor, fontWeight: 'bold' }}
          />
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  input : { 
    padding: 17, 
    borderWidth: 1, 
    borderColor: "#B4B4B4", 
    borderRadius: 10, 
    color: textColorPrimary,
    width: "100%",
    marginBottom: 18,
  },

  whiteBtn: {
    paddingVertical: 12, 
    backgroundColor: "#fff", 
    borderWidth: 1, 
    borderColor: primaryColor, 
    borderRadius: 25,
    width: "100%"
  },

  greenBtn: {
     marginBottom: 10, 
     paddingVertical: 12, 
     backgroundColor: primaryColor, 
     borderWidth: 1, 
     borderColor: primaryColor, 
     borderRadius: 25,
     width: "100%"
  },

  container: {
    flex: 1,
  },
  phoneInput: {
    borderColor: '#ddd',
    borderWidth: 2,
    borderRadius: 2,
    padding: 16
  },
});
