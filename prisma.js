import { PrismaClient } from "@prisma/client";

// DATABASE_URL Prisma читает из environment (см. prisma/schema.prisma)
export const prisma = new PrismaClient();
