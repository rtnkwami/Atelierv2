-- CreateTable
CREATE TABLE "ProductViews" (
    "productId" UUID NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductViews_pkey" PRIMARY KEY ("productId","viewedAt")
);

-- AddForeignKey
ALTER TABLE "ProductViews" ADD CONSTRAINT "ProductViews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
