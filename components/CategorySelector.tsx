import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { colors } from "@/constants/colors";

// Simplified categories
type Category = "general" | "devotional" | "activity" | "scoring";

const categories: { id: Category; label: string }[] = [
  { id: "general", label: "General" },
  { id: "devotional", label: "Devotionals" },
  { id: "activity", label: "Activities" },
  { id: "scoring", label: "Rubric" },
];

type CategorySelectorProps = {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
};

export const CategorySelector = ({
  selectedCategory,
  onSelectCategory,
}: CategorySelectorProps) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategoryButton,
            ]}
            onPress={() => onSelectCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText,
              ]}
            >
              {category.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 100,
  },
  selectedCategoryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    textAlign: "center",
  },
  selectedCategoryText: {
    color: "white",
  },
});