import Cookies from 'js-cookie'

const COOKIE_NAME = 'customer_email'
const COOKIE_EXPIRY_DAYS = 7

export const setCustomerEmail = (email: string) => {
  Cookies.set(COOKIE_NAME, email, {
    expires: COOKIE_EXPIRY_DAYS,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  })
}

export const getCustomerEmail = (): string | undefined => {
  return Cookies.get(COOKIE_NAME)
}

export const clearCustomerEmail = () => {
  Cookies.remove(COOKIE_NAME)
}