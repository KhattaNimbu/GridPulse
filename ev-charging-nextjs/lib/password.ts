export function validatePassword(pw: string) {
  const minLength = 10
  const hasUpper = /[A-Z]/.test(pw)
  const hasLower = /[a-z]/.test(pw)
  const hasDigit = /[0-9]/.test(pw)
  const hasSpecial = /[^A-Za-z0-9]/.test(pw)

  const valid = pw.length >= minLength && hasUpper && hasLower && hasDigit && hasSpecial
  return {
    valid,
    reasons: {
      minLength: pw.length >= minLength,
      hasUpper,
      hasLower,
      hasDigit,
      hasSpecial,
    },
  }
}

export default validatePassword
