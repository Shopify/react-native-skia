import type { ReactNode } from "react";
import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontFamily: "Helvetica",
    fontSize: 16,
    color: "white",
  },
  subtitle: {
    fontFamily: "Helvetica",
    fontSize: 14,
    color: "#8E8E93",
  },
});

interface LinkProps {
  title: string;
  subtitle: string;
  children?: ReactNode | ReactNode[];
}

const Link = ({ title, subtitle, children }: LinkProps) => (
  <View style={styles.container}>
    <View>{children}</View>
    <View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  </View>
);

export const List = () => {
  return (
    <ScrollView
      style={{
        backgroundColor: "#272636",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
    >
      <Link title="Website" subtitle="ethereum.org" />
      <Link title="Explorer" subtitle="blockchain.info" />
      <Link title="View on CoinmarketCap" subtitle="coinmarketcap.com" />
    </ScrollView>
  );
};
