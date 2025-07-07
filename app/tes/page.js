'use client'
import { useEffect, useState } from "react";

export default function TestLocalStorageInterval() {
    const [isRecording, setIsRecording] = useState(false);
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                // Ambil data lama
                const prev = JSON.parse(localStorage.getItem('myStats') || '[]');
                // Data JSON yang ingin disimpan (contoh: counter dan waktu)
                const data = {
                    timestamp: new Date().toISOString(),
                    value: counter,
                    info: { foo: "bar", random: Math.random() }
                };
                prev.push(data);
                localStorage.setItem('myStats', JSON.stringify(prev));
                setCounter(c => c + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording, counter]);

    return (
        <div>
            <button onClick={() => setIsRecording(true)}>Start Interval</button>
            <button onClick={() => setIsRecording(false)}>Stop Interval</button>
            <div>Counter: {counter}</div>
        </div>
    );
}