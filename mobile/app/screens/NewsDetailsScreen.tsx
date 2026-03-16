import { useNavigation } from "@react-navigation/native";
import { View, Text } from "react-native";
export default function NewsDetailsScreen({ route }) {
  const navigation = useNavigation();
  const { article } = route.params;

  return (
    <View>
      <Text>{article.title}</Text>
    </View>
  );
}
