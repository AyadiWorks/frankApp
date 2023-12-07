import React from 'react';
import { StyleSheet, View, Pressable, ImageBackground } from 'react-native';
import Onboarding from "../utils/Intro";
import { Login } from '../navigation/Helpers';
import { RootStackScreenProps } from "../types";
import { getGlobalState } from '../utils/Global';
// import useColorScheme from "../hooks/useColorScheme";

import { BevietBoldText } from '../components/Text';

export default function LandingScreen({ navigation }: RootStackScreenProps<"Landing">) {

  // const colorScheme = useColorScheme();

  function replaceToHome() {
    navigation.replace(Login);
  };

  const Landing1 = () => (
    <ImageBackground source={require("../assets/images/Onboarding1.png")} style={styles.board}/>
  );
  const Landing2 = () => (
    <ImageBackground source={require("../assets/images/Onboarding2.png")} style={styles.board}/>
  );
  const Landing3 = () => (
    <ImageBackground source={require("../assets/images/Onboarding3.png")} style={styles.board}/>
  );

  const Skip = ({ ...props }) => (<></>);

  const Next = ({ ...props }) => (
    <Pressable style={styles.nextBtn} {...props}>
      <BevietBoldText style={{ color: "#fff", fontSize: 24 }}>Next</BevietBoldText>
    </Pressable>
  );

  const Square = ({ isLight, selected } : { isLight: boolean; selected: boolean; }) => (
      <View style={selected ? styles.dotActive : styles.dot}/>
  );

  const Done = ({ ...props }) => (
    <Pressable style={styles.nextBtn} onPress={() => replaceToHome()}>
      <BevietBoldText style={{ color: "#fff", fontSize: 24 }}>Sign in</BevietBoldText>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Onboarding
        bottomBarColor="#D1D9D0"
        DotComponent={Square}
        NextButtonComponent={Next}
        DoneButtonComponent={Done}
        SkipButtonComponent={Skip}
        pages={[
          {
            backgroundColor: "#D1D9D0",
            image: <Landing1 />,
            title: "",
            subtitle: "",
          },
          {
            backgroundColor: "#D1D9D0",
            image: <Landing2 />,
            title: "",
            subtitle: "",
          },
          {
            backgroundColor: "#D1D9D0",
            image: <Landing3 />,
            title: "",
            subtitle: "",
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({

  nextBtn: {
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#707070",
    borderRadius: 10,
    height: 70,
    width: 160,
    alignItems: "center",
    justifyContent: "center",
  },

  dotActive: {
    height: 7,
    width: 7,
    backgroundColor: "#000",
    marginRight: 20,
  },
  
  dot: {
    height: 7,
    width: 7,
    backgroundColor: "#707070",
    marginRight: 20,
  },

  board: {
    marginTop: 30,
    paddingTop: 20,
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  container: {
    flex: 1,
  },
});
