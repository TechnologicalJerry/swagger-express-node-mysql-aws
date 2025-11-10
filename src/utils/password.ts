import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const hashPassword = async (plain: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plain, salt);
};

export const verifyPassword = async (plain: string, hashed: string): Promise<boolean> =>
  bcrypt.compare(plain, hashed);

