import { Modal, ModalProps } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Expo Router automatically injects a SafeAreaProvider into every route —
// but React Native's own <Modal> mounts into a separate native view
// hierarchy (a UIViewController on iOS) that isn't a "route" in Expo
// Router's sense, so that automatic injection never reaches inside it.
// Per react-native-safe-area-context's own guidance: anything backed by
// its own native ViewController (modals included) needs its own
// SafeAreaProvider re-declared at its root. This wraps that once so every
// modal in the app gets correct insets without repeating the fix.
export default function SafeModal({ children, ...modalProps }: ModalProps) {
  return (
    <Modal {...modalProps}>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </Modal>
  );
}
