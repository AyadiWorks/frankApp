import React, { useEffect } from "react";
import { StripeProvider } from "@stripe/stripe-react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from "react-native-safe-area-view";
import { ToastProvider } from "react-native-toast-notifications";
import { STRIPE_KEY, STRIPE_MERCHANT } from "./constants/GlobalConstants";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";
import * as Sentry from 'sentry-expo';
import { LogBox } from 'react-native';


// Ignoring all log box warnings (use with caution)
LogBox.ignoreAllLogs(true);

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Your useEffect code here
  }, []);

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StripeProvider publishableKey={STRIPE_KEY} merchantIdentifier={STRIPE_MERCHANT}>
          <SafeAreaProvider>
            <ToastProvider offset={30} duration={2000}>
              <NavigationContainer>
                <Navigation colorScheme={colorScheme} />
              </NavigationContainer>
            </ToastProvider>
          </SafeAreaProvider>
        </StripeProvider>
      </GestureHandlerRootView>
    );
  }
}
