import { useEffect, useState } from "react";
import styles from './index.module.scss';

interface IProps {
  time: number;
  onEnd: () => void;
}

const CountDown = (props: IProps) => {
  const { time, onEnd } = props;
  const [count, setCount] = useState(time || 60);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCount((count) => {
        if(count === 0) {
          clearTimeout(timerId);
          onEnd && onEnd();
          return count;
        }
        return count - 1;
      });
    }, 1000);
    return () => {
      clearInterval(timerId);
    }
  }, [time, onEnd]);

  return <div className={styles.countDown}>{count}</div>
}

export default CountDown;