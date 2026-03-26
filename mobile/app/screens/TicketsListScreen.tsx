import { useCallback, useState } from "react";
import {
  ImageSourcePropType,
  ListRenderItemInfo,
  View,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function TicketsListScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const noImage =
    "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

  // const renderItem = (info: ListRenderItemInfo<TicketsDTO>) => {
  //   const item = info.item;
  //   const imageSource = item.imagePath
  //     ? { uri: item.imagePath }
  //     : { uri: noImage };
  //   return (
  //     <TouchableOpacity
  //       className="flex-1 flex-row mt-4 h-36"
  //       onPress={() => navigation.navigate("TicketsDetail", { article: info })}
  //     >
  //       <View className="bg-gray-200 rounded-l-lg elevation w-72 border-r-2 border-dashed">
  //         <Image className="w-full h-16 rounded-tl-lg" source={imageSource} />
  //         <View className="border-t-2">
  //           <Text className="text-2xl m-1">{item.name}</Text>
  //           <Text className="text-lg ml-1">{item.description}</Text>
  //         </View>
  //       </View>
  //       <View className="bg-teal-300 items-center rounded-r-lg justify-center">
  //         <View className="-rotate-90 items-center">
  //           <Text className="mt-1">Jegyszám:</Text>
  //           <Text className="mt-1">{item.id}</Text>
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

  interface TicketsListScreenItem {
    id: number;
    name: string;
    description: string;
    price: number;
    imagePath: ImageSourcePropType;
  }
  const MOCK_ITEMS = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Elem ${i + 1}`,
    description: `Ez az elem a ${i + 1} elem rövid leírása`,
    price: i + 1,
    imagePath: { uri: `https://picsum.photos/1920?${i + 1}` },
  }));

  const navigation = useNavigation();

  const renderMockItem = (info: ListRenderItemInfo<TicketsListScreenItem>) => {
    const item = info.item;

    return (
      <View className="h-36">
        <TouchableOpacity
          className="flex-1 flex-row mt-4 self-center"
          onPress={() =>
            navigation.navigate("TicketsDetail", { article: item })
          }
        >
          <View className="bg-gray-200 rounded-l-lg elevation w-72 border-r-2 border-dashed">
            <Image
              className="w-full h-16 rounded-tl-lg"
              source={item.imagePath}
            />
            <View className="border-t-2">
              <Text className="text-2xl m-1">{item.name}</Text>
              <Text className="text-lg ml-1">{item.description}</Text>
            </View>
          </View>
          <View className="bg-teal-300 items-center rounded-r-lg justify-center">
            <View className="-rotate-90 items-center">
              <Text className="mt-1">Jegyszám:</Text>
              <Text className="mt-1">{item.id}</Text>
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
