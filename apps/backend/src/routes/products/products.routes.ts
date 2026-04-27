import { createRoute} from "@hono/zod-openapi";
import {
    ProductSchema,
    ProductListResponseSchema,
    ProductListQuerySchema,
    ProductParamsSchema,
    CreateProductSchema,
    UpdateProductSchema,
    StockInSchema,
} from "./products.schema";
import { commonResponses } from "@/lib";

const tags = ["Products"];

export const listProducts = createRoute({
    path: "/",
    method: "get",
    tags,
    request: { query: ProductListQuerySchema },
    responses: {
        200: {
            content: { "application/json": { schema: ProductListResponseSchema } },
            description: "Mahsulotlar ro'yxati",
        },
        ...commonResponses,
    },
});

export const getOneProduct = createRoute({
    path: "/{id}",
    method: "get",
    tags,
    request: { params: ProductParamsSchema },
    responses: {
        200: {
            content: { "application/json": { schema: ProductSchema } },
            description: "Mahsulot",
        },

        ...commonResponses,
    },
});

export const createProduct = createRoute({
    path: "/",
    method: "post",
    tags,
    request: {
        body: { content: { "application/json": { schema: CreateProductSchema } } },
    },
    responses: {
        201: {
            content: { "application/json": { schema: ProductSchema } },
            description: "Mahsulot yaratildi",
        },
 
        ...commonResponses,
    },
});

export const updateProduct = createRoute({
    path: "/{id}",
    method: "patch",
    tags,
    request: {
        params: ProductParamsSchema,
        body: { content: { "application/json": { schema: UpdateProductSchema } } },
    },
    responses: {
        200: {
            content: { "application/json": { schema: ProductSchema } },
            description: "Yangilandi",
        },

        ...commonResponses,
    },
});

export const deleteProduct = createRoute({
    path: "/{id}",
    method: "delete",
    tags,
    request: { params: ProductParamsSchema },
    responses: {
        204: { description: "O'chirildi" },

        ...commonResponses,
    },
});

// Ombor kirim
export const stockIn = createRoute({
    path: "/{id}/stock-in",
    method: "post",
    tags,
    request: {
        params: ProductParamsSchema,
        body: { content: { "application/json": { schema: StockInSchema } } },
    },
    responses: {
        200: {
            content: { "application/json": { schema: ProductSchema } },
            description: "Ombor yangilandi",
        },
     
        ...commonResponses,
    },
});