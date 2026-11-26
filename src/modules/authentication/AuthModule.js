import crypto from "node:crypto";
import { APP_CONFIG } from "../../../config/appConfig.js";
import { hashPassword, verifyPassword } from "../../utils/cryptoHelper.js";
import { dbStorage } from "../../services/StorageService.js";

/**
 * Модуль 1: Аутентификация и управление профилем пользователя (FR-01, FR-02, FR-10)
 */
export class AuthModule {
  /**
   * Регистрирует нового пользователя в системе
   * @param {Object} userData - { username, email, password }
   * @returns {Object} Созданный профиль пользователя без хеша пароля
   */
  registerUser(userData) {
    const { username, email, password } = userData || {};

    if (!username || username.trim().length < 3) {
      throw new Error("Ошибка валидации: никнейм должен содержать минимум 3 символа.");
    }
    if (!email || !email.includes("@")) {
      throw new Error("Ошибка валидации: указан некорректный адрес электронной почты.");
    }
    if (!password || password.length < APP_CONFIG.MIN_PASSWORD_LENGTH) {
      throw new Error(`Ошибка валидации: пароль должен быть не короче ${APP_CONFIG.MIN_PASSWORD_LENGTH} символов.`);
    }

    const exists = dbStorage.users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase() || u.username === username.trim()
    );
    if (exists) {
      throw new Error("Пользователь с таким логином или email уже зарегистрирован.");
    }

    const newUser = {
      id: crypto.randomUUID(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      role: "Player",
      themeSettings: { ...APP_CONFIG.DEFAULT_THEME }
    };

    dbStorage.users.push(newUser);
    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  /**
   * Выполняет вход пользователя по логину/email и паролю
   * @param {string} login - Никнейм или email
   * @param {string} password - Пароль
   * @returns {Object} Объект сессии с токеном и профилем
   */
  loginUser(login, password) {
    if (!login || !password) {
      throw new Error("Необходимо указать логин и пароль.");
    }

    const user = dbStorage.users.find(
      (u) => u.email === login.trim().toLowerCase() || u.username === login.trim()
    );
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new Error("Ошибка авторизации: неверный логин или пароль.");
    }

    return {
      token: `mv_jwt_${crypto.randomBytes(12).toString("hex")}`,
      userId: user.id,
      username: user.username,
      role: user.role
    };
  }
}
