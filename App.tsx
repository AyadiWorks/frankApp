import { StripeProvider } from "@stripe/stripe-react-native";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-view";
import { ToastProvider } from "react-native-toast-notifications";
import { STRIPE_KEY, STRIPE_MERCHANT } from "./constants/GlobalConstants";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: 'https://41567508ce2e4d268ef631ff4eee7e8e@o1150936.ingest.sentry.io/6231262',
  enableInExpoDevelopment: true,
  debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});



import { LogBox} from 'react-native';

LogBox.ignoreAllLogs(true)
export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  useEffect(() => {
  }, []);

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <StripeProvider
        publishableKey={STRIPE_KEY}
        merchantIdentifier={STRIPE_MERCHANT}
      >
        <SafeAreaProvider>
          <ToastProvider offset={30} duration={2000}>
            <Navigation colorScheme={colorScheme} />
          </ToastProvider>
        </SafeAreaProvider>
      </StripeProvider>
    );
  }
}
