import React, { useState } from "react";
import { View, StyleSheet, FlatList, Text, Pressable, Alert, Platform } from "react-native";
import { Header } from "@/components/Header";
import { CategorySelector } from "@/components/CategorySelector";
import { ResourceCard } from "@/components/ResourceCard";
import { useResourceStore } from "@/store/resourceStore";
import { colors } from "@/constants/colors";
import { Plus, Link as LinkIcon } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Resource } from "@/types";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResourcesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<"general" | "devotional" | "activity" | "scoring">("general");
  const { resources, addResource } = useResourceStore();
  const router = useRouter();
  
  // Get resources for the selected category, including communications in general
  const categoryResources = resources.filter(resource => {
    if (selectedCategory === "general") {
      return resource.category === "general" || resource.category === "communication";
    }
    return resource.category === selectedCategory;
  });

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      const file = result.assets[0];
      
      // Get file size
      let fileSize = 0;
      if (Platform.OS !== "web") {
        const fileInfo = await FileSystem.getInfoAsync(file.uri);
        if (fileInfo.exists) {
          fileSize = fileInfo.size || 0;
        } else {
          fileSize = file.size || 0;
        }
      } else {
        fileSize = file.size || 0;
      }
      
      // Determine file type
      let fileType: Resource["type"] = "other";
      if (file.mimeType?.includes("pdf")) {
        fileType = "pdf";
      } else if (file.mimeType?.includes("image")) {
        fileType = "image";
      }
      
      // Use Alert.alert with a simpler approach for cross-platform
      Alert.alert(
        "Add Resource",
        "Enter a description for this resource",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Add",
            onPress: () => {
              // Use a default description
              const description = "Resource file";
              
              addResource({
                name: file.name,
                description,
                type: fileType,
                uri: file.uri,
                size: fileSize,
                category: selectedCategory === "general" ? "general" : selectedCategory,
              });
              
              Alert.alert(
                "Resource Added",
                "The resource has been added successfully"
              );
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to pick the document");
    }
  };

  const addLink = () => {
    // Use a simpler approach for cross-platform
    Alert.alert(
      "Add Link",
      "Enter a name for this link",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Add",
          onPress: () => {
            // Use default values
            const name = "New Link";
            const url = "https://example.com";
            const description = "Link resource";
            
            addResource({
              name,
              description,
              type: "link",
              uri: url,
              size: 0,
              category: selectedCategory === "general" ? "general" : selectedCategory,
            });
            
            Alert.alert(
              "Link Added",
              "The link has been added successfully"
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Header 
        title="Resources" 
        subtitle="Small group leader materials"
      />
      <CategorySelector 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <FlatList
        data={categoryResources}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ResourceCard resource={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No resources in this category</Text>
            <Text style={styles.emptySubtext}>Add resources by tapping the + button</Text>
          </View>
        }
      />
      <View style={styles.buttonContainer}>
        <Pressable style={styles.addButton} onPress={pickDocument}>
          <Plus size={20} color="white" />
        </Pressable>
        
        <Pressable style={styles.linkButton} onPress={addLink}>
          <LinkIcon size={16} color="white" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding at bottom to prevent content being hidden by tab bar
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
    flexDirection: "column",
    gap: 16,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  linkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});