import { useEffect, useRef } from "react";

export default function useSessionTimer(onExpireSoon: () => void) {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    startTimer();

  function startTimer() {
  clearTimer();
  timerRef.current = window.setTimeout(() => {
    onExpireSoon();
  }, 15 * 1000); // 15 seconds
}


    function resetTimer() {
      startTimer();
    }

    function clearTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
    }

    /* Reset timer on user activity */
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    return () => {
      clearTimer();
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [onExpireSoon]);
}
