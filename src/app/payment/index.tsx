import { useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { WebView } from "react-native-webview";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "../../../store/cartStore";

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
    router.replace({ pathname: "/order/order-status", params: { orderId } });
  };

  return (
    <WebView
      source={{ uri: url }}
      startInLoadingState
      renderLoading={() => (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      )}
      onShouldStartLoadWithRequest={(req) => {
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
    />
  );
}
