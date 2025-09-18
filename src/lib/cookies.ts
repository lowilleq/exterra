import Cookies from 'js-cookie'

const COOKIE_NAME = 'customer_email'
const COOKIE_NAME_FIRST = 'customer_first_name'
const COOKIE_NAME_LAST = 'customer_last_name'
const COOKIE_EXPIRY_DAYS = 7

export const setCustomerEmail = (email: string) => {
  Cookies.set(COOKIE_NAME, email, {
    expires: COOKIE_EXPIRY_DAYS,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  })
}

export const setCustomerName = (firstName: string, lastName: string) => {
  const options = {
    expires: COOKIE_EXPIRY_DAYS,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production'
  }
  Cookies.set(COOKIE_NAME_FIRST, firstName, options)
  Cookies.set(COOKIE_NAME_LAST, lastName, options)
}

export const getCustomerEmail = (): string | undefined => {
  return Cookies.get(COOKIE_NAME)
}

export const getCustomerName = (): { firstName?: string; lastName?: string } => {
  return {
    firstName: Cookies.get(COOKIE_NAME_FIRST),
    lastName: Cookies.get(COOKIE_NAME_LAST)
  }
}

export const clearCustomerEmail = () => {
  Cookies.remove(COOKIE_NAME)
  Cookies.remove(COOKIE_NAME_FIRST)
  Cookies.remove(COOKIE_NAME_LAST)
}