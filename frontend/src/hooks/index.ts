/**
 * 自定义 Hooks
 */

/**
 * 认证检查 Hook
 */
export const useAuth = () => {
  const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('auth_token')
  }

  const getUser = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
    return null
  }

  const getToken = () => {
    return localStorage.getItem('auth_token')
  }

  return {
    isAuthenticated: isAuthenticated(),
    user: getUser(),
    token: getToken(),
  }
}

/**
 * 本地存储 Hook
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  }

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(readValue()) : value
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error)
    }
  }

  return [readValue(), setValue] as const
}
