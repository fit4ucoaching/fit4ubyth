import { CameraView, useCameraPermissions } from "expo-camera";
import { Text, View } from "react-native";

import { Button } from "../../components/Button/Button";
import { Sheet } from "../../components/Modal/Sheet";

export interface BarcodeScannerSheetProps {
  visible: boolean;
  onClose: () => void;
  onScanned: (barcode: string) => void;
}

/** Scanner de code-barres (Volume 4) — caméra native, ferme le sheet dès la première détection. */
export function BarcodeScannerSheet({ visible, onClose, onScanned }: BarcodeScannerSheetProps): JSX.Element {
  const [permission, requestPermission] = useCameraPermissions();

  if (!visible) return <></>;

  if (!permission?.granted) {
    return (
      <Sheet visible={visible} onClose={onClose}>
        <View className="items-center gap-md py-lg">
          <Text className="text-textPrimary text-center">
            L'accès à la caméra est nécessaire pour scanner un code-barres.
          </Text>
          <Button label="Autoriser la caméra" onPress={() => void requestPermission()} />
        </View>
      </Sheet>
    );
  }

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View className="h-80 overflow-hidden rounded-lg">
        <CameraView
          style={{ flex: 1 }}
          barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a"] }}
          onBarcodeScanned={(result) => onScanned(result.data)}
        />
      </View>
    </Sheet>
  );
}
