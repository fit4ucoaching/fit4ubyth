import { Heart, MessageCircle, Send } from "lucide-react-native";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../../components/Avatar/Avatar";
import { Input } from "../../components/Input/Input";
import { useCommunityStore } from "../../store/communityStore";
import { useCreatePost, usePosts, useToggleLike } from "../../services/useCommunity";

/** Fil d'actualité communauté (Volume 4) — publication, like, commentaire. */
export function FeedScreen(): JSX.Element {
  const { data } = usePosts();
  const toggleLike = useToggleLike();
  const createPost = useCreatePost();
  const { draftPostContent, setDraftPostContent } = useCommunityStore();

  const posts = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center gap-sm border-b border-border px-lg py-md">
        <View className="flex-1">
          <Input
            placeholder="Partage ta progression…"
            value={draftPostContent}
            onChangeText={setDraftPostContent}
            accessibilityLabel="Nouvelle publication"
          />
        </View>
        <Pressable
          onPress={() => createPost.mutate({ content: draftPostContent, visibility: "FRIENDS" })}
          disabled={!draftPostContent.trim()}
          accessibilityLabel="Publier"
          className={`h-11 w-11 items-center justify-center rounded-full bg-primary ${!draftPostContent.trim() ? "opacity-40" : ""}`}
        >
          <Send size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-md px-lg py-md pb-xxl"
        renderItem={({ item }) => (
          <View className="gap-sm rounded-lg bg-surface p-md">
            <View className="flex-row items-center gap-sm">
              <Avatar firstName={item.author.firstName} lastName={item.author.lastName} uri={item.author.avatarUrl} size="sm" />
              <Text className="text-textPrimary font-semibold text-sm">{item.author.firstName} {item.author.lastName}</Text>
            </View>
            <Text className="text-textPrimary text-sm">{item.content}</Text>
            <View className="flex-row gap-lg pt-xs">
              <Pressable onPress={() => toggleLike.mutate(item.id)} className="flex-row items-center gap-xs">
                <Heart size={16} color={item.isLikedByMe ? "#FF6B00" : "#767676"} fill={item.isLikedByMe ? "#FF6B00" : "transparent"} />
                <Text className="text-textSecondary text-xs">{item.likesCount}</Text>
              </Pressable>
              <View className="flex-row items-center gap-xs">
                <MessageCircle size={16} color="#767676" />
                <Text className="text-textSecondary text-xs">{item.commentsCount}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
