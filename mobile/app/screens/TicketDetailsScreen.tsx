import { Button } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { View, Text, Image } from "react-native";

export default function TicketsDetailsScreen({ route }) {
  const navigation = useNavigation();
  const { article } = route.params;

  return (
    <View className="flex-1 mt-4 self-center h-full justify-center">
      <View className="bg-gray-200 rounded-l-lg elevation w-72">
        <Image
          className="w-full h-72 rounded-tl-lg"
          source={{ uri: "data:image/png;base64," + article.qrCodeBase64 }}
        />
        <View className="border-t-2">
          <Text className="text-2xl m-1">{article.name}</Text>
        </View>
        <Button
          className="w-3/5 self-center"
          variant="tinted"
          onPress={navigation.goBack}
        >
          <Text>Vissza</Text>
        </Button>
      </View>
    </View>
  );
}
