import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Constants } from "../constants/constants";
import { Images } from "../assets/Images";
import { Clear, GameOver, Mole, Pause } from "../components";

const DEFAULT_TIME = 30;
const DEFAULT_STATE = {
  level: 1,
  score: 0,
  time: DEFAULT_TIME,
  cleared: false,
  paused: false,
  gameover: false,
  health: 100,
};

const Home = () => {
  const molesRef: any = useRef([]);
  const [molePop, setMolePop] = useState<any>(null);
  const [state, setState] = useState(DEFAULT_STATE);
  const [molesPopping, setMolesPopping] = useState(0);
  const intervalRef: any = useRef(null);
  const timeIntervalRef: any = useRef(null);

  const didMount = useRef(false);

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    // Return early, if this is the first render:
    if (!didMount.current) {
      // This check is to determine if the component is being mounted for the first time
      didMount.current = true;
      return;
    }
    // If it's not the first render, it calls the setupTicks() function
    setupTicks();
  }, [state.level]);

  const reset = () => {
    setState(DEFAULT_STATE);
    setMolesPopping(0);
    setupTicks();
  };

  // Function to Start game, setting speed, timer and popping up the mole.
  const setupTicks = () => {
    //Here, speed is the speed at which moles will pop(come) up in the game.
    let speed = 750 - state.level * 50; //For the 1st level, the speed of popping the mole is 700ms.
    if (speed < 350) {
      //If in any level, the speed exceeds 350ms, then resetting it to 350.
      speed = 350;
    }

    intervalRef.current = setInterval(popRandomMole, speed); //Calling popRandomMole() at speed level.
    timeIntervalRef.current = setInterval(timerTick, 1000); //Calling timerTick() at every second, just like a timer.
  };

  const popRandomMole = () => {
    //Checking if the no. of moles is >=12 to avoid overcrowding with moles.
    if (molesRef.current.length >= 12) {
      return;
    }

    let randomIndex = randomBetween(0, 11); //Generating randomIndex for the mole's position to pop-up.

    // It checks 2 conditions -
    //  1. It checks whether the mole at the random index is not already in the process of popping (!molesRef[randomIndex]?.isPopping), and
    //  2. the number of moles currently popping (molesPopping) is less than 3.
    if (!molesRef[randomIndex]?.isPopping && molesPopping < 3) {
      setMolePop(randomIndex); //If both conditions met, then setting a Mole for popping.
    }
  };

  // Calling this function at every second, looking like a timer
  const timerTick = () => {
    //Checking if the time reaches 0, if yes then marking the level as cleared & clearing all the intervals
    if (state.time === 0) {
      clearInterval(intervalRef.current);
      clearInterval(timeIntervalRef.current);
      setState((prevState) => ({
        ...prevState,
        cleared: true,
      }));
    } else {
      // If the game time is not 0, then decrementing it by 1.
      setState((prev) => ({
        ...prev,
        time: --state.time,
      }));
    }
  };

  // Function to show Pause status of game
  const pause = () => {
    // Clearing the intervals and setting the paused variable as true.
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    setState((prevState) => ({
      ...prevState,
      paused: true,
    }));
  };

  // Function to execute Resume status of game
  const resume = () => {
    // Setting the paused variable as false.
    setState((prevState) => ({
      ...prevState,
      paused: false,
    }));
    setupTicks();
    // Calling setupTicks() function to start the game again
  };

  // Function to increase the level after user completes one level
  const nextLevel = () => {
    // Increasing the level & setting other variables to initial state
    setState((prev) => ({
      ...prev,
      level: state.level + 1,
      cleared: false,
      gameover: false,
      time: DEFAULT_TIME,
    }));
    setMolesPopping(0);
  };

  //Function to generate a random integer within a specified range (inclusive).
  const randomBetween = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
    // Math.random() returns a random number between 0 (inclusive),  and 1 (exclusive)
    // Math.random() always returns a number lower than 1.
    // (max - min + 1) - calculates the range of numbers between min and max (inclusive)
    // Adding 1 ensures that the maximum value is inclusive in the range
    // Math.random() * (max - min + 1) - gives a no. between min & max
    // Adding 'min' ensures that the no. is within min and max.
    // At last, Math.floor() rounds down the result to the nearest integer
  };

  const onFinishPopping = (index: any) => {
    setMolesPopping(molesPopping - 1);
  };

  // Function to calculate score
  const onScore = () => {
    setState((prevState) => ({
      ...prevState,
      score: state.score + 1,
    }));
  };

  // Function that handles the logic when the player takes damage in the game
  const onDamage = () => {
    // If the game is already cleared, gameover or paused then directly return
    if (state.cleared || state.gameover || state.paused) {
      return;
    }

    // Calculating the new health of the player after taking damage
    let targetHealth = state.health - 10 < 0 ? 0 : state.health - 16;

    setState((prevState) => ({
      ...prevState,
      health: targetHealth,
    }));

    if (targetHealth <= 0) {
      // If targetHealth reaches to O or less, end the game
      gameOver();
    }
  };

  // Game Over function
  const gameOver = () => {
    clearInterval(intervalRef.current);
    clearInterval(timeIntervalRef.current);

    setState((prevState) => ({
      ...prevState,
      gameover: true,
    }));
  };

  // Function for handling the logic when the player heals in the game.
  const onHeal = () => {
    let targetHealth = state.health + 10 > 100 ? 100 : state.health + 16;
    setState((prevState) => ({
      ...prevState,
      health: targetHealth,
    }));
  };

  // Constants.MAX_WIDTH: This represents the maximum width available for the health bar.
  // Constants.XR: This seems to be a scaling factor used to adapt dimensions to different screen sizes.
  let healthBarWidth =
    ((Constants.MAX_WIDTH -
      Constants.XR * 100 -
      Constants.XR * 60 -
      Constants.XR * 6) *
      state.health) /
    100;

  return (
    <View style={styles.container}>
      <Image
        style={styles.backgroundImage}
        resizeMode="stretch"
        source={Images.background}
      />
      <View style={styles.topPanel}>
        <SafeAreaView>
          <View style={styles.statsContainer}>
            <View style={styles.stats}>
              <View style={styles.levelContainer}>
                <Text style={styles.levelTitle}>Level</Text>
                <Text style={styles.levelNumber}>{state.level}</Text>
              </View>
            </View>
            <View style={styles.stats}>
              <View style={styles.timeBar}>
                <Text style={styles.timeNumber}>{state.time}</Text>
              </View>
              <Image
                style={styles.timeIcon}
                resizeMode="stretch"
                source={Images.timeIcon}
              />
            </View>
            <View style={styles.stats}>
              <View style={styles.scoreBar}>
                <Text style={styles.scoreNumber}>{state.score}</Text>
              </View>
              <Image
                style={styles.scoreIcon}
                resizeMode="stretch"
                source={Images.scoreIcon}
              />
            </View>
            <View style={styles.stats}>
              <TouchableWithoutFeedback onPress={pause}>
                <View style={styles.pauseButton}>
                  <Image
                    style={styles.pauseButtonIcon}
                    resizeMode="stretch"
                    source={Images.pauseIcon}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>

          <View style={styles.healthBarContainer}>
            <View style={styles.healthBar}>
              <View
                style={[styles.healthBarInner, { width: healthBarWidth }]}
              />
            </View>
            <Image
              style={styles.healthIcon}
              resizeMode="stretch"
              source={Images.healthIcon}
            />
          </View>
        </SafeAreaView>
      </View>
      <View style={styles.playArea}>
        {Array.apply(null, Array(4)).map((el, rowIdx) => {
          return (
            <View style={styles.playRow} key={rowIdx}>
              {Array.apply(null, Array(3)).map((el, colIdx) => {
                let moleIdx = rowIdx * 3 + colIdx;
                // console.log("moleIdx =>", moleIdx);
                // console.log("molesRef =>", JSON.stringify(molesRef));

                return (
                  <View style={styles.playCell} key={moleIdx}>
                    <Mole
                      index={moleIdx}
                      ref={(ref: any) => (molesRef[moleIdx] = ref)}
                      onFinishPopping={onFinishPopping}
                      molePop={molePop === moleIdx ? molePop : null}
                      onDamage={onDamage}
                      onHeal={onHeal}
                      onScore={onScore}
                    />
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
      {state.cleared ? (
        <Clear
          onReset={reset}
          onNextLevel={nextLevel}
          level={state.level}
          score={state.score}
        />
      ) : null}
      {state.gameover ? (
        <GameOver onReset={reset} level={state.level} score={state.score} />
      ) : null}
      {state.paused ? <Pause onReset={reset} onResume={resume} /> : null}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },

  backgroundImage: {
    width: Constants.MAX_WIDTH,
    height: Constants.MAX_HEIGHT,
    position: "absolute",
  },
  topPanel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Constants.YR * 250,
    flexDirection: "column",
  },
  statsContainer: {
    width: Constants.MAX_WIDTH,
    height: Constants.YR * 120,
    flexDirection: "row",
  },
  stats: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pauseButton: {
    width: Constants.YR * 50,
    height: Constants.YR * 50,
    backgroundColor: "black",
    borderColor: "white",
    borderWidth: 3,
    borderRadius: 10,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  pauseButtonIcon: {
    width: Constants.YR * 25,
    height: Constants.YR * 25,
  },
  levelContainer: {
    width: Constants.YR * 80,
    height: Constants.YR * 80,
    backgroundColor: "#ff1a1a",
    borderColor: "white",
    borderWidth: 3,
    borderRadius: 10,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  levelTitle: {
    fontSize: 21,
    color: "white",
    fontFamily: "LilitaOne",
  },
  levelNumber: {
    fontSize: 17,
    color: "white",
    fontFamily: "LilitaOne",
  },
  scoreIcon: {
    position: "absolute",
    left: 0,
    width: Constants.YR * 40,
    height: Constants.YR * 40,
  },
  scoreBar: {
    height: Constants.YR * 25,
    position: "absolute",
    left: 20,
    right: 5,
    backgroundColor: "white",
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreNumber: {
    fontSize: 17,
    color: "black",
    fontFamily: "LilitaOne",
  },
  timeIcon: {
    position: "absolute",
    left: 0,
    width: Constants.YR * 40,
    height: Constants.YR * 40,
  },
  timeBar: {
    height: Constants.YR * 25,
    position: "absolute",
    left: 20,
    right: 5,
    backgroundColor: "white",
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  timeNumber: {
    fontSize: 17,
    color: "black",
    fontFamily: "LilitaOne",
  },
  healthBarContainer: {
    height: Constants.YR * 40,
    width: Constants.MAX_WIDTH - Constants.XR * 120,
    marginLeft: Constants.XR * 60,
  },
  healthIcon: {
    position: "absolute",
    top: 0,
    left: 0,
    width: Constants.YR * 46,
    height: Constants.YR * 40,
  },
  healthBar: {
    height: Constants.YR * 20,
    width: Constants.MAX_WIDTH - Constants.XR * 100 - Constants.XR * 60,
    marginLeft: Constants.XR * 40,
    marginTop: Constants.YR * 10,
    backgroundColor: "white",
    borderRadius: Constants.YR * 10,
  },
  healthBarInner: {
    position: "absolute",
    backgroundColor: "#ff1a1a",
    left: Constants.XR * 3,

    top: Constants.YR * 3,
    bottom: Constants.YR * 3,
    borderRadius: Constants.YR * 8,
  },
  playArea: {
    width: Constants.MAX_WIDTH,
    marginTop: Constants.YR * 250,
    height: Constants.MAX_HEIGHT - Constants.YR * 250 - Constants.YR * 112,
    flexDirection: "column",
  },
  playRow: {
    height:
      (Constants.MAX_HEIGHT - Constants.YR * 250 - Constants.YR * 112) / 4,
    width: Constants.MAX_WIDTH,
    flexDirection: "row",
  },
  playCell: {
    width: Constants.MAX_WIDTH / 3,
    height:
      (Constants.MAX_HEIGHT - Constants.YR * 250 - Constants.YR * 112) / 4,
    alignItems: "center",
  },
});
