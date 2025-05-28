export interface FortuneCookie {
  id: string
  text: string
}

export interface InfoCookieState {
  data: FortuneCookie[]
  isLoading: boolean
  hasError: boolean
  error: unknown
}
