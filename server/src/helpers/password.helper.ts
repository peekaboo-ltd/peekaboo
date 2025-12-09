/**
 * Generate a random password
 * @param length - Password length (default: 8)
 * @returns Random password string
 */
export const generateRandomPassword = (length: number = 8): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill remaining length
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

/**
 * Generate a simple numeric PIN
 * @param length - PIN length (default: 6)
 * @returns Random PIN string
 */
export const generateSimplePIN = (length: number = 6): string => {
  let pin = '';
  for (let i = 0; i < length; i++) {
    pin += Math.floor(Math.random() * 10);
  }
  return pin;
};

/**
 * Generate a memorable password (word + numbers)
 * @returns Memorable password
 */
export const generateMemorablePassword = (): string => {
  const words = [
    'Peekaboo', 'Delivery', 'Swift', 'Fast', 'Quick', 'Express',
    'Rocket', 'Lightning', 'Speed', 'Rapid', 'Instant', 'Rush'
  ];
  
  const word = words[Math.floor(Math.random() * words.length)];
  const numbers = Math.floor(Math.random() * 9000) + 1000; // 4-digit number
  
  return `${word}${numbers}`;
};
