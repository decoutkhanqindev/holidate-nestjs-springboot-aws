'use client';
import styles from './Counter.module.css';

interface CounterProps {
    value: number;
    onIncrease: () => void;
    onDecrease: () => void;
    min?: number;
    max?: number;
}

const Counter: React.FC<CounterProps> = ({ value, onIncrease, onDecrease, min = 1, max = 99 }) => {
    return (
        <div className={styles.counter}>
            <button onClick={onDecrease} disabled={value <= min}>-</button>
            <span>{value}</span>
            <button onClick={onIncrease} disabled={value >= max}>+</button>
        </div>
    );
};

export default Counter;