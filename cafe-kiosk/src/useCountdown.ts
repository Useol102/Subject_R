import { useEffect, useRef, useState } from 'react'

/**
 * 실제 키오스크처럼 "남은 시간"을 센다. 화면을 누르거나 키를 치면 처음 값으로 되돌린다.
 * 화면을 내리거나 올리는 것(스크롤)은 조작으로 보지 않는다.
 * 0 이 되면 onExpire 를 한 번 부른다. enabled 가 false 면 멈추고 처음 값으로 되돌린다.
 */
export function useCountdown(enabled: boolean, seconds: number, onExpire: () => void): number {
  const [left, setLeft] = useState(seconds)
  const cb = useRef(onExpire)
  cb.current = onExpire

  useEffect(() => {
    setLeft(seconds)
    if (!enabled) return
    const reset = () => setLeft(seconds)
    // 누르기(click)와 키 입력만 조작으로 본다. 화면을 내리거나 올리는 것(휠 · 손가락 끌기)은
    // click 이 생기지 않으므로 시간을 되돌리지 않는다. 캡처 단계로 받아 다른 처리에 막히지 않게 한다.
    const events = ['click', 'keydown'] as const
    events.forEach((e) => window.addEventListener(e, reset, { capture: true, passive: true }))
    const timer = window.setInterval(() => setLeft((n) => (n > 0 ? n - 1 : 0)), 1000)
    return () => {
      window.clearInterval(timer)
      events.forEach((e) => window.removeEventListener(e, reset, { capture: true }))
    }
  }, [enabled, seconds])

  useEffect(() => {
    if (enabled && left === 0) cb.current()
  }, [enabled, left])

  return left
}
