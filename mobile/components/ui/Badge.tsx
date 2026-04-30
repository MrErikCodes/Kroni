import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { colors, fonts } from "../../lib/theme";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gold"
  | "default";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = "default" }: BadgeProps) {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";

  let bg: string;
  let text: string;
  let border: string | undefined;

  switch (variant) {
    case "success":
      bg = colors.semantic.success + "18";
      text = colors.semantic.success;
      break;
    case "warning":
      bg = colors.semantic.warning + "1A";
      text = colors.semantic.warning;
      break;
    case "danger":
      bg = colors.semantic.danger + "18";
      text = colors.semantic.danger;
      break;
    case "info":
      bg = colors.semantic.info + "18";
      text = colors.semantic.info;
      break;
    case "gold":
      // Solid gold pill — used for "Mer for pengene" / "Best value" style accents.
      bg = colors.gold[500];
      text = colors.sand[900];
      break;
    case "default":
    default:
      bg = isDark ? "#11161D" : colors.sand[100];
      text = isDark ? "#9AA0AA" : colors.sand[700];
      border = isDark ? "#2A3040" : colors.sand[200];
      break;
  }

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: bg,
          borderColor: border ?? "transparent",
          borderWidth: border ? 1 : 0,
        },
      ]}
    >
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.uiBold,
    letterSpacing: 0.4,
  },
});
