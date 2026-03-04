import { Text, View, StyleSheet } from "react-native";
import { Loader } from "./components/Loader/Loader";
import { useEffect, useState } from "react";
import NewsListScreen from "./screens/NewsListScreen";
import { NewsList } from "./components/News/NewsList";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./reactquery";
import LoaderBackground from "./components/Loader/LoaderBackground";
import TicketsListScreen from "./screens/TicketsListScreen";
export default function Index() {
  return (
    <QueryClientProvider client={queryClient}>
      <View className="flex-1 items-center h-screen justify-center">
        <Loader />
        {/* <NewsListScreen></NewsListScreen> */}
        <TicketsListScreen></TicketsListScreen>
      </View>
    </QueryClientProvider>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "white",
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });
