import { Button } from "@react-navigation/elements";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Text } from "@/app/components/ui/text";
import * as React from "react";
import { type TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { api_endpoints } from "@/app/utils/api";
import { saveTokens } from "@/app/utils/auth";

export function SignInForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const passwordInputRef = React.useRef<TextInput>(null);
  const navigation = useNavigation();

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  const handleSubmit = async () => {
    setError("");
    try {
      const response = await fetch(api_endpoints.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError("Hibás email cím vagy jelszó.");
        return;
      }

      const data = await response.json();
      // Save BOTH tokens
      await saveTokens(data.accessToken, data.refreshToken ?? "");
      navigation.navigate("NavTabs" as never);
    } catch {
      setError("Hálózati hiba. Kérjük próbálja újra.");
    }
  };

  return (
    <View className="gap-6">
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">
            Bejelentkezés
          </CardTitle>
          <CardDescription className="text-center sm:text-left">
            Üdvözlünk! Kérjük jelentkezz be a folytatáshoz.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="pelda@email.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                onChangeText={setEmail}
                value={email}
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
              />
            </View>
            <View className="gap-1.5">
              <Label htmlFor="password">Jelszó</Label>
              <Input
                ref={passwordInputRef}
                id="password"
                secureTextEntry
                onChangeText={setPassword}
                value={password}
                onSubmitEditing={handleSubmit}
              />
            </View>
            <Button className="w-full" onPressIn={handleSubmit}>
              Bejelentkezés
            </Button>
          </View>
          {error ? <Text className="text-sm text-red-500">{error}</Text> : null}
        </CardContent>
      </Card>
    </View>
  );
}
