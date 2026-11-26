import assert from "node:assert/strict";
import { AuthModule } from "../src/modules/authentication/AuthModule.js";
import { WorldModule } from "../src/modules/worlds/WorldModule.js";
import { CoordinateModule } from "../src/modules/coordinates/CoordinateModule.js";
import { dbStorage } from "../src/services/StorageService.js";

const auth = new AuthModule();
const worlds = new WorldModule();
const coords = new CoordinateModule();

console.log("=== Запуск первичной проверки модулей MineVault ===");

// Тест 1: AuthModule - корректная регистрация и вход
dbStorage.clearAll();
const u = auth.registerUser({ username: "Steve_MC", email: "steve@mc.net", password: "secretPassword" });
const s = auth.loginUser("steve@mc.net", "secretPassword");
assert.equal(s.username, "Steve_MC");
console.log("[PASS] Тест 1: AuthModule — регистрация и авторизация с корректными данными.");

// Тест 2: AuthModule - некорректный пароль
assert.throws(() => auth.loginUser("steve@mc.net", "wrongPass"), /Ошибка авторизации/);
console.log("[PASS] Тест 2: AuthModule — отказ при вводе неверного пароля.");

// Тест 3: WorldModule - создание мира и валидация пустого названия
const w = worlds.createWorld(u.id, { title: "Хардкор Мир 1", mode: "Singleplayer", seed: "12345" });
assert.equal(w.title, "Хардкор Мир 1");
assert.throws(() => worlds.createWorld(u.id, { title: "" }), /Ошибка валидации/);
console.log("[PASS] Тест 3: WorldModule — создание карточки мира и блокировка пустого названия.");

// Тест 4: CoordinateModule - конвертация 1:8 и валидация нечисловых координат
const res = coords.addCoordinate(w.id, {
  name: "Цитадель",
  dimension: "Overworld",
  x: 1600,
  y: 64,
  z: -800,
  autoNetherPortal: true
});
assert.equal(res.linkedPortal.x, 200);
assert.equal(res.linkedPortal.z, -100);
assert.throws(() => coords.addCoordinate(w.id, { name: "Баг", dimension: "Overworld", x: "abc", y: 64, z: 0 }), /Ошибка валидации/);
console.log("[PASS] Тест 4: CoordinateModule — добавление координат, расчёт 1:8 (1600 -> 200) и перехват ошибки ввода.");

console.log("=== Все 4 интеграционных и модульных теста пройдены успешно! ===");
