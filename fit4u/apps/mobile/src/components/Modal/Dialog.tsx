import { Text, View } from "react-native";

import { Button } from "../Button/Button";
import { Modal } from "./Modal";

export interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isDestructive?: boolean;
}

/** Dialogue de confirmation — preset au-dessus de `Modal` (suppression, déconnexion…). */
export function Dialog({
  visible,
  onClose,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  onConfirm,
  isDestructive = false,
}: DialogProps): JSX.Element {
  return (
    <Modal visible={visible} onClose={onClose} title={title}>
      {description ? <Text className="mb-lg text-textSecondary text-sm">{description}</Text> : null}
      <View className="flex-row gap-sm">
        <View className="flex-1">
          <Button label={cancelLabel} variant="outline" onPress={onClose} fullWidth />
        </View>
        <View className="flex-1">
          <Button
            label={confirmLabel}
            variant={isDestructive ? "danger" : "primary"}
            onPress={onConfirm}
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}
