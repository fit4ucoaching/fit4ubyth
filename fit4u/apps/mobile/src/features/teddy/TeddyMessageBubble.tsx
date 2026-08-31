import type { TeddyMessage } from "@fit4u/teddy-sdk";
import { Text, View } from "react-native";

export function TeddyMessageBubble({ message }: { message: TeddyMessage }): JSX.Element {
  const isUser = message.role === "user";

  return (
    <View className={`max-w-[80%] rounded-lg px-md py-sm ${isUser ? "self-end bg-primary" : "self-start bg-surfaceElevated"}`}>
      <Text className={isUser ? "text-white" : "text-textPrimary"}>{message.content}</Text>
    </View>
  );
}
