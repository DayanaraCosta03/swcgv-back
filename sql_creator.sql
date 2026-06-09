-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

-- DROP TYPE public."user_role_enum";

CREATE TYPE public."user_role_enum" AS ENUM (
	'admin',
	'seller');

-- DROP SEQUENCE category_id_seq;

CREATE SEQUENCE category_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE client_id_seq;

CREATE SEQUENCE client_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE product_id_seq;

CREATE SEQUENCE product_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE purchase_id_seq;

CREATE SEQUENCE purchase_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE purchase_item_id_seq;

CREATE SEQUENCE purchase_item_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE sale_id_seq;

CREATE SEQUENCE sale_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE sale_item_id_seq;

CREATE SEQUENCE sale_item_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE supplier_id_seq;

CREATE SEQUENCE supplier_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE user_id_seq;

CREATE SEQUENCE user_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;-- public.category definition

-- Drop table

-- DROP TABLE category;

CREATE TABLE category (
	id serial4 NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY (id)
);


-- public.client definition

-- Drop table

-- DROP TABLE client;

CREATE TABLE client (
	id serial4 NOT NULL,
	"name" varchar(255) NOT NULL,
	"phoneNumber" varchar(15) NULL,
	notes varchar(255) NULL,
	CONSTRAINT "PK_96da49381769303a6515a8785c7" PRIMARY KEY (id)
);


-- public.purchase_item definition

-- Drop table

-- DROP TABLE purchase_item;

CREATE TABLE purchase_item (
	id serial4 NOT NULL,
	quantity int4 NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"totalPrice" numeric(10, 2) NOT NULL,
	CONSTRAINT "PK_e7e6cd38bb62fd147ab2f91f656" PRIMARY KEY (id)
);


-- public.supplier definition

-- Drop table

-- DROP TABLE supplier;

CREATE TABLE supplier (
	id serial4 NOT NULL,
	"name" varchar(100) NOT NULL,
	"phoneNumber" varchar(15) NOT NULL,
	address text NULL,
	CONSTRAINT "PK_2bc0d2cab6276144d2ff98a2828" PRIMARY KEY (id)
);


-- public."user" definition

-- Drop table

-- DROP TABLE "user";

CREATE TABLE "user" (
	id serial4 NOT NULL,
	"name" varchar(50) NOT NULL,
	email varchar(255) NOT NULL,
	"password" text NOT NULL,
	"role" public."user_role_enum" NOT NULL,
	"needChangePassword" bool DEFAULT true NOT NULL,
	"isActive" bool DEFAULT true NOT NULL,
	CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id),
	CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email)
);


-- public.product definition

-- Drop table

-- DROP TABLE product;

CREATE TABLE product (
	id serial4 NOT NULL,
	"name" varchar(200) NOT NULL,
	description text NOT NULL,
	price numeric(10, 2) NOT NULL,
	stock int4 NOT NULL,
	"imageUrl" varchar NOT NULL,
	"categoryId" int4 NOT NULL,
	category_id int4 NULL,
	CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY (id),
	CONSTRAINT "FK_0dce9bc93c2d2c399982d04bef1" FOREIGN KEY (category_id) REFERENCES category(id)
);


-- public.purchase definition

-- Drop table

-- DROP TABLE purchase;

CREATE TABLE purchase (
	id serial4 NOT NULL,
	"date" date NOT NULL,
	total numeric(10, 2) NOT NULL,
	supplier_id int4 NULL,
	CONSTRAINT "PK_86cc2ebeb9e17fc9c0774b05f69" PRIMARY KEY (id),
	CONSTRAINT "FK_8d9a856657c46725d085c73e4fc" FOREIGN KEY (supplier_id) REFERENCES supplier(id)
);


-- public.sale definition

-- Drop table

-- DROP TABLE sale;

CREATE TABLE sale (
	id serial4 NOT NULL,
	"saleDate" timestamp NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	client_id int4 NULL,
	CONSTRAINT "PK_d03891c457cbcd22974732b5de2" PRIMARY KEY (id),
	CONSTRAINT "FK_f2ac9b019aa29ebcfaecf7bb3cc" FOREIGN KEY (client_id) REFERENCES client(id)
);


-- public.sale_item definition

-- Drop table

-- DROP TABLE sale_item;

CREATE TABLE sale_item (
	id serial4 NOT NULL,
	quantity int4 NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"totalPrice" numeric(10, 2) NOT NULL,
	sale_id int4 NOT NULL,
	product_id int4 NOT NULL,
	CONSTRAINT "PK_439a57a4a0d130329d3d2e671b6" PRIMARY KEY (id),
	CONSTRAINT fk_sale_item_productcheck FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_sale_item_sale FOREIGN KEY (sale_id) REFERENCES sale(id) ON DELETE RESTRICT ON UPDATE CASCADE
);