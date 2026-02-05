import z from "zod";

export const BodySchema = z.array(z.number()).min(2);
