-- CreateTable
CREATE TABLE "Products" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "long_description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "images" TEXT[],

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);
