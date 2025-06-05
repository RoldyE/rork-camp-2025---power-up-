import React from "react";
import { Tabs } from "expo-router";
import { Calendar, Award, Users, BarChart, FileText } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textLight,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            height: Platform.OS === 'ios' ? 90 : 70,
            paddingBottom: Platform.OS === 'ios' ? 30 : 15,
            paddingTop: 10,
          },
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: "600",
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: 0,
            paddingBottom: 4,
          },
          tabBarIconStyle: {
            marginBottom: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Schedule",
            tabBarLabel: "Schedule",
            tabBarIcon: ({ color }) => <Calendar size={18} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="games"
          options={{
            title: "Activities",
            tabBarLabel: "Activities",
            tabBarIcon: ({ color }) => <Award size={18} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="teams"
          options={{
            title: "Teams",
            tabBarLabel: "Teams",
            tabBarIcon: ({ color }) => <Users size={18} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="nominations"
          options={{
            title: "Nominations",
            tabBarLabel: "Vote",
            tabBarIcon: ({ color }) => <BarChart size={18} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="resources"
          options={{
            title: "Resources",
            tabBarLabel: "Resources",
            tabBarIcon: ({ color }) => <FileText size={18} color={color} />,
            headerShown: false,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}