import { Link } from "expo-router";
import { StyleSheet, Text } from "react-native";

export default function NotFoundScreen() {
	return (
		<>
			<Link href="/">
				<Text style={styles.linkText}>Go to home screen!</Text>
			</Link>
		</>
	);
}

const styles = StyleSheet.create({
	linkText: {
		fontSize: 14,
		color: "#2e78b7",
	},
});
