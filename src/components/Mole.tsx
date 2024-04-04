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

  // The useImperativeHandle hook is used in React functional components to customize the instance value
  // that is exposed by a ref when used with forwardRef.
  useImperativeHandle(ref, () => ({
    playAnimation(type: string, fps: number, onFinish: () => void) {
      moleRef.current.play({
        type,
        fps,
        onFinish,
      });
    },
    // When the playAnimation method is called, it accesses the moleRef
    // (a reference to a sprite animation component) and calls its play method,
    // passing in the animation type, fps, and onFinish callback.
  }));
  // The purpose of using useImperativeHandle here is to expose a specific method (playAnimation)
  // of the moleRef.current instance to the parent component.
  // This allows the parent component to trigger specific animations on the mole component
  // by calling playAnimation through the ref.

  // Function for handling the logic when the mole pops up in the game
  const pop = () => {
    // Setting whack & attack variables to false and setting pop variable to true.
    setIsWhacked(false);
    setIsAttacking(false);
    setIsPopping(true);

    // Randomly determines whether the mole will be feisty based on a 40% chance.
    // Fiesty means the mole attacks the player if not whacked in time.
    const feisty = Math.random() < 0.4;
    setIsFeisty(feisty);

    // Randomly determines whether the mole will be healing based on a 5% chance.
    const healing = Math.random() < 0.05;
    if (!feisty) {
      setIsHealing(healing);
      // Sets the state indicating whether the mole is healing, but only if it's not feisty.
    }

    // Handling Healing Animation
    if (healing) {
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
          // After healing animation, hiding animation triggers.
          // And after hiding animation finishes, mole is considered to be popped down
        },
      });
    } else {
      // Handling Regular Animation (Appearance) with attack
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
            // After Appearance animation finishes, it checks if the mole is feisty.
            // If yes, then triggering the attack animation while making attack variable to true
            // and calling the onDamage() function.
            // Finally, hiding animation triggers.
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
            // If the mole is not feisty, it simply hides the mole after a delay without any attack animation.
          }
        },
      });
    }
  };

  // Whack means Attack. (Just for future reference)
  // Function to handle the logic when the mole is whacked by the player
  const whack = () => {
    // At first, checking if the mole is popping or attacked or attacking. If yes, then don't go further.
    if (!isPopping || isWhacked || isAttacking) {
      return;
    }

    // If there's an existing action timeout, then clearing it out.
    if (actionTimeoutRef.current) {
      clearTimeout(actionTimeoutRef.current);
    }

    // Now, setting whacked variable to true & feisty to false showing that
    // now the mole is whacked (so no attacking from mole side).
    setIsWhacked(true);
    setIsFeisty(false);

    // Letting the parent component know to update the score.
    props.onScore();
    // If the mole is in the healing state, then calling onHeal() function to heal the mole.
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
    // After whack, triggering the dizzy animation to represent the mole reaction after been whacked.
    // After that, finally triggering the faint animation to hide the mole setting isPopping variable false
    // Finally, calling onFinishPopping() function to let parent component know that
    // the mole is gone down to pop another mole up.
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
