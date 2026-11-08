-- prisma/constraints.sql
-- Constraints, partial indexes, triggers and sequences that Prisma cannot express in schema.prisma.
--
-- HOW TO APPLY: this file is NOT run by Prisma on its own.
--   1. npx prisma migrate dev --create-only --name init
--   2. Paste this file's contents at the END of the generated migration.sql
--   3. npx prisma migrate dev
--   4. Run `npx prisma migrate dev` once more: it should report no pending changes.

--------------------------------------------------------
-- 1. EXPRESSION INDEXES
--------------------------------------------------------
-- Unique case-insensitive user email
CREATE UNIQUE INDEX IF NOT EXISTS "users_lower_email_idx" ON "users" (LOWER("email"));

--------------------------------------------------------
-- 2. PARTIAL UNIQUE INDEXES
--------------------------------------------------------
-- At most one primary image per product
CREATE UNIQUE INDEX IF NOT EXISTS "product_images_one_primary_idx"
ON "product_images" ("product_id")
WHERE "is_primary" = TRUE;

-- At most one active cart per user
CREATE UNIQUE INDEX IF NOT EXISTS "carts_one_active_per_user_idx"
ON "carts" ("user_id")
WHERE "status" = 'ACTIVE' AND "user_id" IS NOT NULL;

-- At most one successful payment per order.
-- APP NOTE: a second successful callback (e.g. customer paid twice) will violate this.
-- Catch the unique violation in the webhook handler, record that payment as
-- RECONCILIATION_REQUIRED instead, and flag the order for a refund.
CREATE UNIQUE INDEX IF NOT EXISTS "payments_one_successful_per_order_idx"
ON "payments" ("order_id")
WHERE "status" = 'SUCCESSFUL';

-- Idempotency guard for inventory operations (safe against retries).
-- CONVENTION: reference_id MUST be unique per operation:
--   RESERVATION / RESERVATION_RELEASE -> the order id (a new checkout is a new order)
--   FULFILLMENT                       -> the shipment id (allows partial shipments)
--   RETURN_RECEIVED                   -> the refund/return id
-- INITIAL_STOCK, STOCK_RECEIVED and MANUAL_ADJUSTMENT are intentionally NOT deduplicated.
CREATE UNIQUE INDEX IF NOT EXISTS "inventory_movements_op_dedup_idx"
ON "inventory_movements" ("inventory_id", "movement_type", "reference_id")
WHERE "reference_id" IS NOT NULL
  AND "movement_type" IN ('RESERVATION', 'RESERVATION_RELEASE', 'FULFILLMENT', 'RETURN_RECEIVED');

-- Low-stock query optimization. Only used by queries whose WHERE clause matches the
-- predicate exactly: (quantity_on_hand - quantity_reserved) <= low_stock_threshold
CREATE INDEX IF NOT EXISTS "inventory_low_stock_idx"
ON "inventory" ("quantity_on_hand", "quantity_reserved", "low_stock_threshold")
WHERE ("quantity_on_hand" - "quantity_reserved") <= "low_stock_threshold";

--------------------------------------------------------
-- 3. CHECK CONSTRAINTS
--------------------------------------------------------
-- Products
ALTER TABLE "products" ADD CONSTRAINT "chk_products_price_non_negative" CHECK ("price_minor" >= 0);

-- Inventory
ALTER TABLE "inventory" ADD CONSTRAINT "chk_inventory_qty_on_hand_non_negative" CHECK ("quantity_on_hand" >= 0);
ALTER TABLE "inventory" ADD CONSTRAINT "chk_inventory_qty_reserved_non_negative" CHECK ("quantity_reserved" >= 0);
ALTER TABLE "inventory" ADD CONSTRAINT "chk_inventory_reserved_le_on_hand" CHECK ("quantity_reserved" <= "quantity_on_hand");
ALTER TABLE "inventory" ADD CONSTRAINT "chk_inventory_low_stock_non_negative" CHECK ("low_stock_threshold" >= 0);

-- Inventory Movements
ALTER TABLE "inventory_movements" ADD CONSTRAINT "chk_movements_change_not_zero" CHECK ("quantity_change" <> 0);

-- Carts
-- APP NOTE: when a guest cart is claimed on login, set user_id AND guest_token_hash = NULL
-- in the same UPDATE, or this constraint rejects it.
ALTER TABLE "carts" ADD CONSTRAINT "chk_carts_exact_one_owner" CHECK (num_nonnulls("user_id", "guest_token_hash") = 1);

-- Cart Items
ALTER TABLE "cart_items" ADD CONSTRAINT "chk_cart_items_qty_positive" CHECK ("quantity" > 0);

-- Orders
ALTER TABLE "orders" ADD CONSTRAINT "chk_orders_subtotal_non_negative" CHECK ("subtotal_minor" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "chk_orders_delivery_fee_non_negative" CHECK ("delivery_fee_minor" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "chk_orders_discount_non_negative" CHECK ("discount_minor" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "chk_orders_total_non_negative" CHECK ("total_minor" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "chk_orders_total_math_correct" CHECK ("total_minor" = ("subtotal_minor" + "delivery_fee_minor" - "discount_minor"));

-- Order Items
ALTER TABLE "order_items" ADD CONSTRAINT "chk_order_items_qty_positive" CHECK ("quantity" > 0);
ALTER TABLE "order_items" ADD CONSTRAINT "chk_order_items_unit_price_non_negative" CHECK ("unit_price_minor" >= 0);
ALTER TABLE "order_items" ADD CONSTRAINT "chk_order_items_line_total_correct" CHECK ("line_total_minor" = ("unit_price_minor" * "quantity"));

-- Shipping Methods
ALTER TABLE "shipping_methods" ADD CONSTRAINT "chk_shipping_fee_non_negative" CHECK ("fee_minor" >= 0);
ALTER TABLE "shipping_methods" ADD CONSTRAINT "chk_shipping_days_min_le_max" CHECK ("estimated_days_min" IS NULL OR "estimated_days_max" IS NULL OR "estimated_days_min" <= "estimated_days_max");

-- Shipment Items
ALTER TABLE "shipment_items" ADD CONSTRAINT "chk_shipment_items_qty_positive" CHECK ("quantity" > 0);

-- Payments
ALTER TABLE "payments" ADD CONSTRAINT "chk_payments_amount_positive" CHECK ("amount_minor" > 0);

-- Refunds
-- APP NOTE: SUM(refunds.amount_minor) <= payments.amount_minor must be enforced in the
-- service layer (inside a transaction that locks the payment row).
ALTER TABLE "refunds" ADD CONSTRAINT "chk_refunds_amount_positive" CHECK ("amount_minor" > 0);

--------------------------------------------------------
-- 4. APPEND-ONLY PROTECTION FOR INVENTORY MOVEMENTS
--------------------------------------------------------
-- Rows may never be deleted or edited, with ONE exception: Prisma's onDelete: SetNull on
-- created_by may null that column (when a user row is removed). Every other column must be unchanged.
CREATE OR REPLACE FUNCTION prevent_inventory_movements_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND OLD."created_by" IS NOT NULL
     AND NEW."created_by" IS NULL
     AND ROW(NEW."id", NEW."inventory_id", NEW."movement_type", NEW."quantity_change",
             NEW."reference_type", NEW."reference_id", NEW."note", NEW."created_at")
         IS NOT DISTINCT FROM
         ROW(OLD."id", OLD."inventory_id", OLD."movement_type", OLD."quantity_change",
             OLD."reference_type", OLD."reference_id", OLD."note", OLD."created_at")
  THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Inventory movements are append-only. % operations are forbidden.', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trg_prevent_inventory_movements_modification" ON "inventory_movements";
CREATE TRIGGER "trg_prevent_inventory_movements_modification"
BEFORE UPDATE OR DELETE ON "inventory_movements"
FOR EACH ROW EXECUTE FUNCTION prevent_inventory_movements_modification();

-- Row-level triggers do not fire on TRUNCATE, so block it explicitly.
-- NOTE: this also blocks TRUNCATE in test/seed cleanup scripts; use DELETE-free resets
-- (drop and recreate the test database) or temporarily drop this trigger in test setup.
DROP TRIGGER IF EXISTS "trg_prevent_inventory_movements_truncate" ON "inventory_movements";
CREATE TRIGGER "trg_prevent_inventory_movements_truncate"
BEFORE TRUNCATE ON "inventory_movements"
FOR EACH STATEMENT EXECUTE FUNCTION prevent_inventory_movements_modification();

--------------------------------------------------------
-- 5. SEQUENCES
--------------------------------------------------------
-- App builds order numbers like 'GS-' || nextval('order_number_seq')
CREATE SEQUENCE IF NOT EXISTS "order_number_seq" START 1000;
