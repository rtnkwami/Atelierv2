import { faker } from "@faker-js/faker";

function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export function generateDefaultShopName() {
    const nounOne = faker.word.noun();
    const nounTwo = faker.word.noun();

    const formattedShopName =  `${capitalize(nounOne)} ${capitalize(nounTwo)}'s Shop`;
    return formattedShopName;
}