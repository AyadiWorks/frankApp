import * as React from "react";
import { Text, TextProps } from "./Themed";


export function BevietBoldText(props: TextProps) {
  return (
    <Text {...props} style={[props.style, { fontFamily: "beviet-bold" }]} />
  );
}

export function BevietText(props: TextProps) {
  return (
    <Text {...props} style={[props.style, { fontFamily: "beviet-regular" }]} />
  );
}
