import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle
} from "react-native";
import {BevietBoldText, BevietText} from "../components/Text";

interface Props {
  containerStyle?: ViewStyle;
  label: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  selected?: boolean;
  detail?: string | undefined;
  onPress: (text: string) => void;
  textStyle?: TextStyle;
  loading?: boolean | false;
}

const FormChip: React.FC<Props> = ({
  label,
  iconLeft,
  iconRight,
  containerStyle,
  selected,
  onPress,
  textStyle,
  detail,
  loading,
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        onPress(label);
      }}
      style={{ ...styles.primaryButton, ...containerStyle }}
    >
      <>{iconLeft}</>
      <BevietText
        style={{
          ...styles.appButtonText,
          ...textStyle,
        }}
      >
        {label}
      </BevietText>
      {loading && <ActivityIndicator style={{ marginHorizontal: 10 }} size="small" color={"#fff"} />}
      <>{iconRight}</>
    </TouchableOpacity>
  );
};

export default FormChip;
const styles = StyleSheet.create({
  primaryButton: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  appButtonText: {
    fontSize: 18,
    alignSelf: "center",
    textAlign: "center",
  },
});
