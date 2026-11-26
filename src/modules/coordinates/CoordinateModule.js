import crypto from "node:crypto";
import { APP_CONFIG } from "../../../config/appConfig.js";
import { dbStorage } from "../../services/StorageService.js";

/**
 * Модуль 3: Учёт навигационных координат и конвертация 1:8 (FR-05, FR-06, FR-09)
 */
export class CoordinateModule {
  /**
   * Пересчитывает координаты между Верхним миром и Незером (коэффициент 1:8)
   * @param {number} x - Координата X
   * @param {number} z - Координата Z
   * @param {string} fromDimension - Исходное измерение ("Overworld" или "The Nether")
   * @returns {Object} Пересчитанные координаты { dimension, x, z }
   */
  convertNetherRatio(x, z, fromDimension) {
    if (typeof x !== "number" || typeof z !== "number" || Number.isNaN(x) || Number.isNaN(z)) {
      throw new Error("Ошибка расчёта: координаты X и Z должны быть числами.");
    }

    if (fromDimension === "Overworld") {
      return {
        dimension: "The Nether",
        x: Math.round(x / APP_CONFIG.NETHER_RATIO),
        z: Math.round(z / APP_CONFIG.NETHER_RATIO)
      };
    }
    if (fromDimension === "The Nether") {
      return {
        dimension: "Overworld",
        x: Math.round(x * APP_CONFIG.NETHER_RATIO),
        z: Math.round(z * APP_CONFIG.NETHER_RATIO)
      };
    }
    throw new Error("Конвертация 1:8 поддерживается только между Overworld и The Nether.");
  }

  /**
   * Добавляет точку координат к миру (с опциональным созданием парного портала)
   * @param {string} worldId - ID мира
   * @param {Object} coordDto - { name, dimension, x, y, z, category, autoNetherPortal }
   * @returns {Object} Сохраняемая точка (и связанная точка портала при наличии)
   */
  addCoordinate(worldId, coordDto) {
    const worldExists = dbStorage.worlds.some((w) => w.id === worldId);
    if (!worldExists) {
      throw new Error("Ошибка: указанный мир или сервер не найден.");
    }

    const { name, dimension, x, y, z, category, autoNetherPortal } = coordDto || {};
    if (!name || name.trim() === "") {
      throw new Error("Ошибка валидации: укажите название навигационной точки.");
    }
    if (!APP_CONFIG.SUPPORTED_DIMENSIONS.includes(dimension)) {
      throw new Error("Ошибка валидации: недопустимое измерение Minecraft.");
    }
    if ([x, y, z].some((val) => typeof val !== "number" || Number.isNaN(val))) {
      throw new Error("Ошибка валидации: координаты X, Y, Z должны быть корректными числами.");
    }

    const mainPoint = {
      id: crypto.randomUUID(),
      worldId,
      name: name.trim(),
      dimension,
      x,
      y,
      z,
      category: category || "База"
    };
    dbStorage.coordinates.push(mainPoint);

    let linkedPortal = null;
    if (autoNetherPortal && (dimension === "Overworld" || dimension === "The Nether")) {
      const converted = this.convertNetherRatio(x, z, dimension);
      linkedPortal = {
        id: crypto.randomUUID(),
        worldId,
        name: `${name.trim()} (Портал ${converted.dimension})`,
        dimension: converted.dimension,
        x: converted.x,
        y,
        z: converted.z,
        category: "Портал"
      };
      dbStorage.coordinates.push(linkedPortal);
    }

    return { mainPoint, linkedPortal };
  }

  /**
   * Фильтрует координаты мира по измерению и поисковому запросу
   * @param {string} worldId - ID мира
   * @param {string} dimension - Фильтр измерения (необязательно)
   * @param {string} query - Поисковая подстрока (необязательно)
   * @returns {Array} Отфильтрованный список точек
   */
  searchCoordinates(worldId, dimension = "", query = "") {
    return dbStorage.coordinates.filter((pt) => {
      const matchWorld = pt.worldId === worldId;
      const matchDim = dimension ? pt.dimension === dimension : true;
      const matchQuery = query ? pt.name.toLowerCase().includes(query.toLowerCase()) : true;
      return matchWorld && matchDim && matchQuery;
    });
  }
}
