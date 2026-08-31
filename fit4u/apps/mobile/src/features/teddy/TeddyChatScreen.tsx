import { Mic, Send } from "lucide-react-native";
import { useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Input } from "../../components/Input/Input";
import { useSendTeddyMessage, useSendTeddyVoice } from "../../services/useTeddy";
import { useTeddyStore } from "../../store/teddyStore";
import { TeddyMessageBubble } from "./TeddyMessageBubble";
import { TeddyTypingIndicator } from "./TeddyTypingIndicator";
import { useVoiceRecorder } from "./useVoiceRecorder";

/**
 * Écran plein écran du chat Teddy (Volume 4 : "interface conversationnelle
 * premium — chat, historique, suggestions, voix"). Partage le même state
 * (`teddyStore`) que la bulle flottante `TeddyBubble` : ouvrir l'écran
 * depuis n'importe quel point d'entrée affiche exactement la même conversation.
 */
export function TeddyChatScreen(): JSX.Element {
  const { messages, isTyping, suggestedActions } = useTeddyStore();
  const sendMessage = useSendTeddyMessage();
  const sendVoice = useSendTeddyVoice();
  const { isRecording, startRecording, stopRecording } = useVoiceRecorder();
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList>(null);

  const handleSend = (): void => {
    if (!draft.trim()) return;
    sendMessage.mutate(draft.trim());
    setDraft("");
  };

  const handleMicPress = async (): Promise<void> => {
    if (isRecording) {
      const formData = await stopRecording();
      if (formData) sendVoice.mutate(formData);
    } else {
      await startRecording();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="border-b border-border px-lg py-md">
        <Text className="text-textPrimary text-lg font-bold">Teddy</Text>
        <Text className="text-textSecondary text-xs">Ton coach IA</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TeddyMessageBubble message={item} />}
          contentContainerClassName="gap-sm px-lg py-md"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping ? <TeddyTypingIndicator /> : null}
        />

        {suggestedActions.length > 0 ? (
          <View className="flex-row flex-wrap gap-xs px-lg pb-sm">
            {suggestedActions.map((action) => (
              <Pressable key={action.label} className="rounded-full border border-primary px-md py-xs">
                <Text className="text-primary text-xs font-medium">{action.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View className="flex-row items-end gap-sm border-t border-border px-lg py-md">
          <View className="flex-1">
            <Input
              placeholder="Écris à Teddy…"
              value={draft}
              onChangeText={setDraft}
              multiline
              accessibilityLabel="Message à Teddy"
            />
          </View>
          <Pressable
            onPress={() => void handleMicPress()}
            accessibilityLabel={isRecording ? "Arrêter l'enregistrement" : "Message vocal"}
            className={`h-11 w-11 items-center justify-center rounded-full ${isRecording ? "bg-danger" : "bg-surfaceElevated"}`}
          >
            <Mic size={18} color={isRecording ? "#FFFFFF" : "#B3B3B3"} />
          </Pressable>
          <Pressable
            onPress={handleSend}
            disabled={!draft.trim()}
            accessibilityLabel="Envoyer"
            className={`h-11 w-11 items-center justify-center rounded-full bg-primary ${!draft.trim() ? "opacity-40" : ""}`}
          >
            <Send size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
