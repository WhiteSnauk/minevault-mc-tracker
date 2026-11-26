/**
 * Сервис имитации in-memory хранилища данных MineVault (слой доступа к данным)
 */
export class StorageService {
  constructor() {
    this.users = [];
    this.worlds = [];
    this.coordinates = [];
  }

  clearAll() {
    this.users = [];
    this.worlds = [];
    this.coordinates = [];
  }
}

export const dbStorage = new StorageService();
