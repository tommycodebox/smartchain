export const sortChars = (data: Record<string, any>) => {
  return JSON.stringify(data).split('').sort().join('')
}
