import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ListRenderItemInfo,
  ImageSourcePropType,
} from "react-native";

import NewsDetailsScreen from "./NewsDetailsScreen";
import { useNavigation } from "@react-navigation/native";
import { api_endpoints } from "@/app/config/api";

interface NewsListScreenItem {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  imagePath: string;
}

async function fetchNews(): Promise<NewsListScreenItem[]> {
  try {
    const res = await fetch(api_endpoints.news);
    if (!res.ok) throw new Error("Failed fetch");
    return (await res.json()) as NewsListScreenItem[];
  } catch (err) {
    console.error("Error fetching news:", err);
    return [];
  }
}

export default function NewsListScreen() {
  const [posts, setPosts] = useState<NewsListScreenItem[]>([]);

  useEffect(() => {
    let active = true;
    fetchNews().then((items) => {
      if (active) setPosts(items);
    });
    return () => {
      active = false;
    };
  }, []);

  const noImage =
    "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

  const navigation = useNavigation();
  return (
    <View className="flex-1">
      {posts.map(({ id, imagePath, title }) => (
        <TouchableOpacity
          key={id}
          onPress={() => navigation.navigate("NewsDetail", { article: posts })}
        >
          <View className="h-20 w-full">
            <Text className="text-2xl font-bold mt-2 mb-1">{title}</Text>
            <View className="bg-transparent rounded-lg p-3 elevation w-48">
              <Image source={{ uri: imagePath }} className="w-full h-full" />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
