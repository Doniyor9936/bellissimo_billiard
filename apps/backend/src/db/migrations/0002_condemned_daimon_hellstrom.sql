CREATE TYPE "public"."cash_transaction_type" AS ENUM('kirim', 'chiqim');--> statement-breakpoint
CREATE TYPE "public"."customer_loyalty" AS ENUM('bronze', 'silver', 'gold');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('naqd', 'karta', 'click', 'payme', 'bolib_tolash');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('taom', 'zakuska', 'ichimlik', 'choy_qahva', 'kalyan', 'boshqa');--> statement-breakpoint
CREATE TYPE "public"."product_unit" AS ENUM('shisha', 'kg', 'dona', 'paket', 'litr');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('active', 'paused', 'closed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."shift_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."table_category" AS ENUM('standard', 'vip');--> statement-breakpoint
CREATE TYPE "public"."table_status" AS ENUM('bosh', 'band', 'bron', 'yopiq');--> statement-breakpoint
CREATE TYPE "public"."table_type" AS ENUM('america', 'rus_piramida', 'snooker');--> statement-breakpoint
CREATE TABLE "tables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"number" integer NOT NULL,
	"type" "table_type" NOT NULL,
	"category" "table_category" DEFAULT 'standard' NOT NULL,
	"hourly_rate" integer NOT NULL,
	"min_rate" integer,
	"status" "table_status" DEFAULT 'bosh' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tables_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone" varchar(20),
	"loyalty_tier" "customer_loyalty" DEFAULT 'bronze' NOT NULL,
	"loyalty_points" integer DEFAULT 0 NOT NULL,
	"total_spent" integer DEFAULT 0 NOT NULL,
	"total_visits" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"last_visited_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table_id" uuid NOT NULL,
	"cashier_id" uuid NOT NULL,
	"customer_id" uuid,
	"shift_id" uuid NOT NULL,
	"guest_count" integer DEFAULT 1 NOT NULL,
	"guest_name" text,
	"table_type" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paused_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"total_minutes" integer,
	"hourly_rate" integer NOT NULL,
	"game_amount" integer,
	"order_amount" integer DEFAULT 0 NOT NULL,
	"service_charge_pct" integer DEFAULT 10 NOT NULL,
	"service_charge_amount" integer,
	"discount_amount" integer DEFAULT 0 NOT NULL,
	"total_amount" integer,
	"status" "session_status" DEFAULT 'active' NOT NULL,
	"discount_reason" text,
	"loyalty_points_earned" integer DEFAULT 0 NOT NULL,
	"loyalty_points_used" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"user_id" uuid,
	"type" varchar(20) NOT NULL,
	"quantity" integer NOT NULL,
	"quantity_before" integer NOT NULL,
	"quantity_after" integer NOT NULL,
	"unit_cost" integer,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"category" "product_category" NOT NULL,
	"unit" "product_unit" NOT NULL,
	"cost_price" integer,
	"selling_price" integer NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"min_stock" integer DEFAULT 5 NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"is_sold_separately" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"description" text,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" varchar(150) NOT NULL,
	"unit_price" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"total_price" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"cashier_id" uuid NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"total_amount" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"cashier_id" uuid NOT NULL,
	"customer_id" uuid,
	"shift_id" uuid NOT NULL,
	"receipt_number" varchar(20) NOT NULL,
	"game_amount" integer NOT NULL,
	"order_amount" integer NOT NULL,
	"subtotal" integer NOT NULL,
	"service_charge" integer NOT NULL,
	"discount_amount" integer DEFAULT 0 NOT NULL,
	"total_amount" integer NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"amount_paid" integer NOT NULL,
	"change_amount" integer DEFAULT 0 NOT NULL,
	"status" "payment_status" DEFAULT 'completed' NOT NULL,
	"loyalty_points_earned" integer DEFAULT 0 NOT NULL,
	"loyalty_points_used" integer DEFAULT 0 NOT NULL,
	"apply_loyalty_points" boolean DEFAULT false NOT NULL,
	"refund_reason" text,
	"refunded_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_receipt_number_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
CREATE TABLE "cash_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shift_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "cash_transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cashier_id" uuid NOT NULL,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"scheduled_close" timestamp with time zone,
	"opening_cash" integer DEFAULT 0 NOT NULL,
	"total_cash" integer DEFAULT 0 NOT NULL,
	"total_card" integer DEFAULT 0 NOT NULL,
	"total_click" integer DEFAULT 0 NOT NULL,
	"total_receipts" integer DEFAULT 0 NOT NULL,
	"cancelled_receipts" integer DEFAULT 0 NOT NULL,
	"status" "shift_status" DEFAULT 'open' NOT NULL,
	"x_report_printed_at" timestamp with time zone,
	"z_report_data" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_name" varchar(100) DEFAULT 'Bellissimo Billiard' NOT NULL,
	"address" text,
	"phone" varchar(20),
	"website" varchar(100),
	"currency" varchar(10) DEFAULT 'UZS' NOT NULL,
	"open_time" varchar(5) DEFAULT '12:00' NOT NULL,
	"close_time" varchar(5) DEFAULT '02:00' NOT NULL,
	"service_charge_pct" integer DEFAULT 10 NOT NULL,
	"service_charge_enabled" boolean DEFAULT true NOT NULL,
	"loyalty_enabled" boolean DEFAULT true NOT NULL,
	"points_per_1000" integer DEFAULT 1 NOT NULL,
	"bronze_threshold" integer DEFAULT 0 NOT NULL,
	"silver_threshold" integer DEFAULT 500 NOT NULL,
	"gold_threshold" integer DEFAULT 2000 NOT NULL,
	"receipt_header" text,
	"receipt_footer" text,
	"receipt_show_logo" boolean DEFAULT true NOT NULL,
	"tax_enabled" boolean DEFAULT false NOT NULL,
	"ofd_enabled" boolean DEFAULT false NOT NULL,
	"ofd_endpoint" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'kassir'::text;--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'kassir', 'ofitsiant');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'kassir'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_table_id_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_cashier_id_users_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_cashier_id_users_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_cashier_id_users_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_cashier_id_users_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;