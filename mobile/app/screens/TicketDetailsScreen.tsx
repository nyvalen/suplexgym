import { useNavigation } from "@react-navigation/native";
import { View, Text, Image } from "react-native";

export default function TicketsDetailsScreen({ route }) {
  const navigation = useNavigation();
  const { article } = route.params;

  const qrcode = `https://api.qrserver.com/v1/create-qr-code/?size=300X300&data=Felhasználó: ${article.id} Jegy típusa: ${article.name}`;

  const imageSource = { uri: qrcode };

  return (
    <View className="flex-1 mt-4 self-center">
      <View className="bg-gray-200 rounded-l-lg elevation w-72">
        <Image className="w-full h-72 rounded-tl-lg" source={imageSource} />
        <View className="border-t-2">
          <Text className="text-2xl m-1">{article.name}</Text>
          <Text className="text-lg ml-1">{article.description}</Text>
        </View>
      </View>
    </View>
  );
}
