import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ListRenderItemInfo,
  ImageSourcePropType,
} from "react-native";
import { useRestApi } from "../hooks/useRestApi";
import type { NewsDTO } from "../types";
import NewsDetailsScreen from "./NewsDetailsScreen";
import { useNavigation } from "@react-navigation/native";

interface NewsListScreenItem {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  imagePath: ImageSourcePropType;
}
export default function NewsListScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const noImage =
    "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

  const { items, refetchItems } = useRestApi<NewsDTO>("/api/news");

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchItems();
    setRefreshing(false);
  }, []);

  const navigation = useNavigation();

  // const renderItem = (info: ListRenderItemInfo<NewsDTO>) => {
  //   const item = info.item;
  //   const imageSource = { uri: info.item.imagePath };
  //   return (
  //     <TouchableOpacity
  //       className="flex-1 flex-row h-28"
  //       onPress={() => navigation.navigate("NewsDetail", { article: item })}
  //     >
  //       <View className="bg-transparent rounded-lg p-3 elevation w-48">
  //         <Image source={imageSource} className="w-full h-full" />
  //       </View>
  //       <View className="h-20 w-full">
  //         <Text className="text-2xl font-bold mt-2 mb-1">{item.title}</Text>
  //         <View className="justify-end">
  //           <Text className="text-gray-500">{item.subtitle}</Text>
  //         </View>
  //       </View>
  //     </TouchableOpacity>
  //   );
  // };

  // return (
  //   <View className="flex-1">
  //     <FlatList
  //       data={items}
  //       keyExtractor={(items) => items.id.toString()}
  //       renderItem={renderItem}
  //       refreshing={refreshing}
  //       onRefresh={onRefresh}
  //     />
  //   </View>
  // );

  const MOCK_ITEMS = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `ElemELEMELEMEEELEEELLEELLEEEMEKJFBEKBFEKJBEKJBFJKJEBFEBFKEFBEFK`,
    subtitle: `Ez az elem a ${i + 1} elem rövid leírása`,
    content: `Elem ${i + 1}`,
    imagePath: { uri: `https://picsum.photos/1920?${i + 1}` },
  }));

  const renderMockItem = (info: ListRenderItemInfo<NewsListScreenItem>) => {
    const item = info.item;
    return (
      <View className="h-28">
        <TouchableOpacity
          className="flex-1 flex-row"
          onPress={() => navigation.navigate("NewsDetail", { article: item })}
        >
          <View className="bg-transparent rounded-lg p-3 w-48">
            <Image source={item.imagePath} className="w-full h-full" />
          </View>
          <View className="h-20">
            <Text className="text-2xl font-bold mt-2 mb-1 pr-3">
              {item.title}
            </Text>
            <View className="justify-end">
              <Text className="text-gray-500">{item.subtitle}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <FlatList
        data={MOCK_ITEMS}
        keyExtractor={(items) => items.id.toString()}
        renderItem={renderMockItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}
