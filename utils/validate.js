// Content verification tools

// Check if the email address is correct
const emailReg = /^[\w.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
export const isEmailCorrect = (str) => emailReg.test(str);