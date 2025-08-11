import { AppDataSource } from '../src/config/database';

beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
});

afterAll(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
});

beforeEach(async () => {
    const entities = AppDataSource.entityMetadatas;
    for (const entity of entities) {
        const repository = AppDataSource.getRepository(entity.name);
        await repository.clear();
    }
});
