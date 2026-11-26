import { AuthModule } from "./modules/authentication/AuthModule.js";
import { WorldModule } from "./modules/worlds/WorldModule.js";
import { CoordinateModule } from "./modules/coordinates/CoordinateModule.js";

const auth = new AuthModule();
const worlds = new WorldModule();
const coords = new CoordinateModule();

console.log("=== Запуск демонстрации программных модулей MineVault v0.4.0 ===");

// 1. Регистрация и вход пользователя
const user = auth.registerUser({
  username: "WhiteSnauk",
  email: "snauk@minevault.ru",
  password: "CraftPassword123"
});
const session = auth.loginUser("WhiteSnauk", "CraftPassword123");
console.log("[AuthModule] Успешный вход:", session);

// 2. Создание карточки сервера
const server = worlds.createWorld(user.id, {
  title: "SMP Приватный Сезон 4",
  mode: "Multiplayer",
  mcVersion: "1.21.4",
  coreType: "Fabric",
  seed: "-4829104829104",
  serverIp: "play.smp-vault.ru",
  isPublic: true
});
console.log("[WorldModule] Создана карточка сервера:", server.title, "| IP:", server.serverIp);

// 3. Добавление координат с авторасчётом портала в Незер (1:8)
const createdCoords = coords.addCoordinate(server.id, {
  name: "Главная база в вишнёвой роще",
  dimension: "Overworld",
  x: 800,
  y: 72,
  z: -1600,
  category: "База",
  autoNetherPortal: true
});
console.log("[CoordinateModule] Точка Overworld:", createdCoords.mainPoint);
console.log("[CoordinateModule] Авто-портал в Незере (1:8):", createdCoords.linkedPortal);

// 4. Поиск и фильтрация точек
const netherPoints = coords.searchCoordinates(server.id, "The Nether", "база");
console.log("[CoordinateModule] Результат фильтрации в Незере:", netherPoints);
