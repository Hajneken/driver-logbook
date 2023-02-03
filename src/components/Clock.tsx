import { useEffect, useState } from "react";
import { useStopwatch } from "react-timer-hook";
import styled from "styled-components/native";

export default function Clock({ startTime }) {

  const [currentTime] = useState(new Date());

  // get seconds elapsed since start time
  const secondsElapsedSinceStartTime = currentTime.getTime() / 1000 - startTime.getTime() / 1000;
  // shift stopwatch start time
  const offset = currentTime.setSeconds(currentTime.getSeconds() + secondsElapsedSinceStartTime);

  const { seconds, minutes, hours } = useStopwatch({
    autoStart: true,
    offsetTimestamp: offset,
  });

  return (
    <ClockContainer>
      <ClockItem>{hours} h</ClockItem>
      <ClockItem>{minutes} min</ClockItem>
      <ClockItem>{seconds} s</ClockItem>
    </ClockContainer>
  );
}

const ClockContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  margin: 10px 10px;
`;

const ClockItem = styled.Text`
  flex: 1;
  font-size: 30px;
  text-align: center;
`;
