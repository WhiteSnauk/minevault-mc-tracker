import crypto from "node:crypto";
import { dbStorage } from "../../services/StorageService.js";

/**
 * Модуль 2: Управление карточками миров и серверов Minecraft (FR-04)
 */
export class WorldModule {
  /**
   * Создаёт новую карточку одиночного мира или сервера
   * @param {string} ownerId - Идентификатор владельца
   * @param {Object} worldDto - Данные мира { title, mode, mcVersion, coreType, seed, serverIp, isPublic }
   * @returns {Object} Созданная карточка мира
   */
  createWorld(ownerId, worldDto) {
    if (!ownerId) {
      throw new Error("Доступ запрещён: требуется идентификатор пользователя.");
    }
    if (!worldDto || !worldDto.title || worldDto.title.trim() === "") {
      throw new Error("Ошибка валидации: название мира или сервера не может быть пустым.");
    }

    const mode = worldDto.mode === "Multiplayer" ? "Multiplayer" : "Singleplayer";
    if (mode === "Multiplayer" && (!worldDto.serverIp || worldDto.serverIp.trim() === "")) {
      throw new Error("Ошибка валидации: для многопользовательского сервера необходимо указать IP-адрес.");
    }

    const worldCard = {
      id: crypto.randomUUID(),
      ownerId,
      title: worldDto.title.trim(),
      mode,
      mcVersion: worldDto.mcVersion || "1.21.4",
      coreType: worldDto.coreType || "Vanilla",
      seed: worldDto.seed || "Не указан",
      serverIp: mode === "Multiplayer" ? worldDto.serverIp.trim() : null,
      isPublic: Boolean(worldDto.isPublic),
      mods: [],
      players: [],
      createdAt: new Date().toISOString()
    };

    dbStorage.worlds.push(worldCard);
    return worldCard;
  }

  /**
   * Возвращает список всех миров конкретного пользователя
   * @param {string} ownerId - Идентификатор владельца
   * @returns {Array} Массив карточек миров
   */
  getUserWorlds(ownerId) {
    return dbStorage.worlds.filter((w) => w.ownerId === ownerId);
  }
}
