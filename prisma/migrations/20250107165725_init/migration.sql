-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "token_img_url" TEXT NOT NULL,
    "token_name" TEXT NOT NULL,
    "ticker_symbol" TEXT,
    "token_description" TEXT,
    "raised_token" TEXT,
    "market_cap" DOUBLE PRECISION,
    "volume_24h" DOUBLE PRECISION,
    "website_url" TEXT,
    "twitter_url" TEXT,
    "telegram_url" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chain" TEXT,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_address_key" ON "Token"("address");
