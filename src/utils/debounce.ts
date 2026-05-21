export interface DebouncedFunction<T extends (...args: never[]) => unknown> {
  (...args: Parameters<T>): void
  cancel: () => void
}

/** 防抖：延迟执行，重复调用会重置计时；支持 cancel */
export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  delay = 300
): DebouncedFunction<T> {
  let timer: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn(...args)
    }, delay)
  }

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return debounced
}
