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
      didMount.current = true;
      return;
    }
    setupTicks();
  }, [state.level]);

  const reset = () => {
    setState(DEFAULT_STATE);
    setMolesPopping(0);
    setupTicks();
  };

  const setupTicks = () => {
    let speed = 750 - state.level * 50;
    if (speed < 350) {
      speed = 350;
    }

    intervalRef.current = setInterval(popRandomMole, speed); //Currently, it's set to 3 seconds, it should be speed
    timeIntervalRef.current = setInterval(timerTick, 1000);
  };

  const popRandomMole = () => {
    if (molesRef.current.length >= 12) {
      return;
    }

    let randomIndex = randomBetween(0, 11);

    if (!molesRef[randomIndex]?.isPopping && molesPopping < 3) {
      setMolePop(randomIndex);
    }
  };

  const timerTick = () => {
    if (state.time === 0) {
      clearInterval(intervalRef.current);
      clearInterval(timeIntervalRef.current);
      setState((prevState) => ({
        ...prevState,
        cleared: true,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        time: --state.time,
      }));
    }
  };

  const pause = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    setState((prevState) => ({
      ...prevState,
      paused: true,
    }));
  };

  const resume = () => {
    setState((prevState) => ({
      ...prevState,
      paused: false,
    }));
    setupTicks();
  };

  const nextLevel = () => {
    setState((prev) => ({
      ...prev,
      level: state.level + 1,
      cleared: false,
      gameover: false,
      time: DEFAULT_TIME,
    }));
    setMolesPopping(0);
  };

  const randomBetween = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const onFinishPopping = (index: any) => {
    setMolesPopping(molesPopping - 1);
  };

  const onScore = () => {
    setState((prevState) => ({
      ...prevState,
      score: state.score + 1,
    }));
  };

  const onDamage = () => {
    if (state.cleared || state.gameover || state.paused) {
      return;
    }

    let targetHealth = state.health - 10 < 0 ? 0 : state.health - 16;

    setState((prevState) => ({
      ...prevState,
      health: targetHealth,
    }));

    if (targetHealth <= 0) {
      gameOver();
    }
  };

  const gameOver = () => {
    clearInterval(intervalRef.current);
    clearInterval(timeIntervalRef.current);

    setState((prevState) => ({
      ...prevState,
      gameover: true,
    }));
  };

  const onHeal = () => {
    let targetHealth = state.health + 10 > 100 ? 100 : state.health + 16;
    setState((prevState) => ({
      ...prevState,
      health: targetHealth,
    }));
  };

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
