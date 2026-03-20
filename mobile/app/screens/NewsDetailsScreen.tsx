import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import { Button } from "@react-navigation/elements";
import { Text } from "@/app/components/ui/text";

export default function NewsDetailsScreen({ route }) {
  const navigation = useNavigation();
  const { article } = route.params;

  return (
    <View className="flex-1 h-full justify-center">
      <Text>{article.title}</Text>
      <Text>{article.content}</Text>
      <Button
        className="w-3/5 self-center"
        variant="tinted"
        onPress={navigation.goBack}
      >
        <Text>Vissza</Text>
      </Button>
    </View>
  );
}
