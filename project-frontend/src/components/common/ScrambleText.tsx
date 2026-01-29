import { useEffect, useState, useCallback, useRef } from "react";

interface ScrambleTextProps {
    text: string;
    duration?: number;
    revealDuration?: number;
    scrambleSpeed?: number;
    className?: string;
    trigger?: boolean;
}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}[]|;:,.<>?/";

export default function ScrambleText({
    text,
    duration = 1000,
    revealDuration = 500,
    scrambleSpeed = 50,
    className = "",
    trigger = true,
}: ScrambleTextProps) {
    const [displayText, setDisplayText] = useState(text);
    const [isScrambling, setIsScrambling] = useState(false);
    const animationRef = useRef<NodeJS.Timeout | null>(null);

    const scramble = useCallback(() => {
        if (isScrambling) return;
        setIsScrambling(true);

        let start: number | null = null;
        const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;

            if (progress < duration) {
                const scrambled = text
                    .split("")
                    .map((char, index) => {
                        if (char === " ") return " ";
                        const revealProgress = (progress / duration) * text.length;
                        if (index < revealProgress && progress > revealDuration) return text[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("");

                setDisplayText(scrambled);
                animationRef.current = setTimeout(() => requestAnimationFrame(step), scrambleSpeed);
            } else {
                setDisplayText(text);
                setIsScrambling(false);
            }
        };

        requestAnimationFrame(step);
    }, [text, duration, revealDuration, scrambleSpeed, isScrambling]);

    useEffect(() => {
        if (trigger) {
            scramble();
        }
        return () => {
            if (animationRef.current) clearTimeout(animationRef.current);
        };
    }, [trigger, text]);

    return <span className={className}>{displayText}</span>;
}
