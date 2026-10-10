import { useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { WebView } from "react-native-webview";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "../../store/cartStore";

const CALLBACK_PREFIX =
  "https://seventy-sulfur-chute.ngrok-free.dev/payment/callback"; // must match callback_url sent to Paystack
const PAYSTACK_CLOSE = "https://standard.paystack.co/close";

export default function PaymentScreen() {
  const { url, orderId } = useLocalSearchParams<{
    url: string;
    orderId: string;
  }>();
  const qc = useQueryClient();
  const done = useRef(false);

  const { clearCart } = useCartStore();

  const finish = (status: "success" | "cancelled") => {
    if (done.current) return;
    done.current = true;
    if (status === "success") {
      clearCart();
      qc.invalidateQueries({ queryKey: ["orders"] });
    }
    router.replace({ pathname: "/tracking", params: { orderId } });
  };

  return (
    <WebView
      source={{ uri: url }}
      onShouldStartLoadWithRequest={(req) => {
        // console.log("SHOULD_START", req.url);
        if (req.url.startsWith(CALLBACK_PREFIX)) {
          finish("success");
          return false;
        }
        if (req.url.startsWith(PAYSTACK_CLOSE)) {
          finish("cancelled");
          return false;
        }
        return true;
      }}
      onNavigationStateChange={(s) => {
        console.log("NAV", s.url);
        if (s.url.startsWith(CALLBACK_PREFIX)) finish("success");
      }}
      onError={(e) => console.log("ERR", e.nativeEvent)}
      onHttpError={(e) =>
        console.log("HTTP_ERR", e.nativeEvent.statusCode, e.nativeEvent.url)
      }
    />
  );
}
