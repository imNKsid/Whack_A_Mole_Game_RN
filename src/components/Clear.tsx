import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React from "react";
import { styles } from "./styles";
import { Images } from "../assets/Images";

const Clear = (props: any) => {
  return (
    <View style={styles.clearScreen}>
      <View style={styles.clearedLevelContainer}>
        <Text style={styles.clearedLevelText}>Level</Text>
        <Text style={styles.clearedLevelText}>{props.level}</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Cleared</Text>
        <Text style={styles.panelText}>Score: {props.score}</Text>

        <View style={styles.panelButtonsContainer}>
          <TouchableWithoutFeedback onPress={props.onReset}>
            <View style={styles.panelButton}>
              <Image
                style={styles.panelButtonIcon}
                resizeMode="contain"
                source={Images.restartIcon}
              />
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={props.onNextLevel}>
            <View style={styles.panelButton}>
              <Image
                style={styles.panelButtonIcon}
                resizeMode="contain"
                source={Images.playIcon}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </View>
  );
};

export default Clear;
