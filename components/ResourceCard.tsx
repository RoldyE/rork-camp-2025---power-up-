import React from "react";
import { View, Text, StyleSheet, Pressable, Alert, Linking } from "react-native";
import { FileText, Image, File, Trash2, Link as LinkIcon } from "lucide-react-native";
import { Resource } from "@/types";
import { colors } from "@/constants/colors";
import { useResourceStore } from "@/store/resourceStore";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

type ResourceCardProps = {
  resource: Resource;
  onPress?: () => void;
};

export const ResourceCard = ({ resource, onPress }: ResourceCardProps) => {
  const { deleteResource } = useResourceStore();

  const getIcon = () => {
    switch (resource.type) {
      case "pdf":
        return <FileText size={20} color={colors.primary} />;
      case "image":
        return <Image size={20} color={colors.primary} />;
      case "link":
        return <LinkIcon size={20} color={colors.primary} />;
      default:
        return <File size={20} color={colors.primary} />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "";
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handlePress = async () => {
    if (resource.type === "link") {
      try {
        const supported = await Linking.canOpenURL(resource.uri);
        if (supported) {
          await Linking.openURL(resource.uri);
        } else {
          Alert.alert("Error", "Cannot open this URL");
        }
      } catch (error) {
        Alert.alert("Error", "An error occurred while opening the link");
      }
    } else if (onPress) {
      onPress();
    } else {
      handleShare();
    }
  };

  const handleShare = async () => {
    if (resource.type === "link") {
      try {
        await Sharing.shareAsync(resource.uri);
      } catch (error) {
        Alert.alert("Error", "Could not share the link");
      }
      return;
    }
    
    if (Platform.OS === "web") {
      Alert.alert("Sharing not available", "This feature is not available on web");
      return;
    }
    
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(resource.uri);
      } else {
        Alert.alert("Sharing not available", "Sharing is not available on this device");
      }
    } catch (error) {
      Alert.alert("Error", "Could not share the file");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Resource",
      "Are you sure you want to delete this resource?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: () => deleteResource(resource.id),
          style: "destructive" 
        }
      ]
    );
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.9 : 1 }
      ]}
    >
      <View style={styles.iconContainer}>{getIcon()}</View>
      <View style={styles.contentContainer}>
        <Text style={styles.name}>{resource.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {resource.description}
        </Text>
        <View style={styles.metaContainer}>
          {resource.size > 0 && (
            <Text style={styles.meta}>
              {formatSize(resource.size)} • Added {formatDate(resource.dateAdded)}
            </Text>
          )}
          {resource.size === 0 && (
            <Text style={styles.meta}>
              Added {formatDate(resource.dateAdded)}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.actionsContainer}>
        <Pressable onPress={handleShare} style={styles.actionButton}>
          <Text style={styles.actionText}>Share</Text>
        </Pressable>
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Trash2 size={16} color={colors.error} />
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: `${colors.primary}10`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  meta: {
    fontSize: 12,
    color: colors.textLight,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${colors.primary}15`,
    borderRadius: 16,
  },
  actionText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.error}10`,
  },
});