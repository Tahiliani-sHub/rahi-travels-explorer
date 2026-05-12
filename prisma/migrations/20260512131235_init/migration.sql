-- RedefineIndex
DROP INDEX "sqlite_autoindex_Coupon_2";
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
