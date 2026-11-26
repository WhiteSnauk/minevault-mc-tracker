import crypto from "node:crypto";

/**
 * Генерирует криптографический хеш пароля с солью
 * @param {string} password - Исходный пароль
 * @returns {string} Строка формата salt:hash
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Проверяет соответствие пароля сохранённому хешу
 * @param {string} password - Введённый пароль
 * @param {string} storedHash - Сохранённый хеш формата salt:hash
 * @returns {boolean} Результат проверки
 */
export function verifyPassword(password, storedHash) {
  const [salt, key] = storedHash.split(":");
  const hashBuffer = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");
  return crypto.timingSafeEqual(hashBuffer, keyBuffer);
}
