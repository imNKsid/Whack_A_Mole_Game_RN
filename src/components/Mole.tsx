import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { View, TouchableWithoutFeedback, StyleSheet } from "react-native";
import { Images } from "../assets/Images";
import SpriteSheet from "rn-sprite-sheet";

const Mole = React.forwardRef((props: any, ref) => {
  const [isPopping, setIsPopping] = useState(false);
  const [isFeisty, setIsFeisty] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [isWhacked, setIsWhacked] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);

  const moleRef: any = useRef(null);
  const actionTimeoutRef: any = useRef(null);

  useEffect(() => {
    if (props.molePop) {
      pop();
    }
  }, [props.molePop]);

  useImperativeHandle(ref, () => ({
    playAnimation(type: string, fps: number, onFinish: () => void) {
      moleRef.current.play({
        type,
        fps,
        onFinish,
      });
    },
  }));

  const pop = () => {
    setIsWhacked(false);
    setIsAttacking(false);
    setIsPopping(true);

    setIsFeisty(Math.random() < 0.4);
    if (!isFeisty) {
      setIsHealing(Math.random() < 0.05);
    }

    if (isHealing) {
      moleRef.current.play({
        type: "heal",
        fps: 24,
        onFinish: () => {
          actionTimeoutRef.current = setTimeout(() => {
            moleRef.current.play({
              type: "hide",
              fps: 24,
              onFinish: () => {
                setIsPopping(false);
                props.onFinishPopping(props.index);
              },
            });
          }, 1000);
        },
      });
    } else {
      moleRef.current.play({
        type: "appear",
        fps: 24,
        onFinish: () => {
          if (isFeisty) {
            actionTimeoutRef.current = setTimeout(() => {
              setIsAttacking(true);
              props.onDamage();
              moleRef.current.play({
                type: "attack",
                fps: 12,
                onFinish: () => {
                  moleRef.current.play({
                    type: "hide",
                    fps: 24,
                    onFinish: () => {
                      setIsPopping(false);
                      props.onFinishPopping(props.index);
                    },
                  });
                },
              });
            }, 1000);
          } else {
            actionTimeoutRef.current = setTimeout(() => {
              moleRef.current.play({
                type: "hide",
                fps: 24,
                onFinish: () => {
                  setIsPopping(false);
                  props.onFinishPopping(props.index);
                },
              });
            }, 1000);
          }
        },
      });
    }
  };

  const whack = () => {
    if (!isPopping || isWhacked || isAttacking) {
      return;
    }

    if (actionTimeoutRef.current) {
      clearTimeout(actionTimeoutRef.current);
    }

    setIsWhacked(true);
    setIsFeisty(false);

    props.onScore();
    if (isHealing) {
      props.onHeal();
    }

    moleRef.current.play({
      type: "dizzy",
      fps: 24,
      onFinish: () => {
        moleRef.current.play({
          type: "faint",
          fps: 24,
          onFinish: () => {
            setIsPopping(false);
            props.onFinishPopping(props.index);
          },
        });
      },
    });
  };

  return (
    <View style={styles.container}>
      <SpriteSheet
        ref={moleRef}
        source={Images.sprites}
        columns={6}
        rows={8}
        width={100}
        animations={{
          idle: [0],
          appear: [1, 2, 3, 4],
          hide: [4, 3, 2, 1, 0],
          dizzy: [36, 37, 38],
          faint: [42, 43, 44, 0],
          attack: [11, 12, 13, 14, 15, 16],
          heal: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
        }}
      />
      <TouchableWithoutFeedback onPress={whack} style={styles.whackStyle}>
        <View style={styles.whackStyle} />
      </TouchableWithoutFeedback>
    </View>
  );
});

export default Mole;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  whackStyle: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
});
