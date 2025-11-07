import { faker } from "@faker-js/faker";

type ProductData = {
    name: string;
    short_description: string;
    long_description: string;
    category: string;
    price: number;
    stock: number;
    images?: string[];
}

export const generateFakeProducts = (overrides?: Partial<ProductData>): ProductData => {
    return {
        name: faker.commerce.product(),
        short_description: faker.commerce.productDescription(),
        long_description: faker.commerce.productDescription(),
        category: faker.commerce.department(),
        price: Number(faker.commerce.price({ min: 1, max: 2000, dec: 2 })),
        stock: faker.number.int({ min: 0, max: 200 }),
        ...overrides
    }
}