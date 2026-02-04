import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "./index.js";
import { BodySchema } from "./sort.body.schema.js";

describe("Express App", () => {
  it("should be defined", () => {
    expect(app).toBeDefined();
  });

  it("GET / should return hello message", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hello, World!" });
  });

  it("GET /health should return ok status", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("Sorting endpoint", () => {
  it("POST /sort should return 400 if body is empty", async () => {
    const response = await request(app).post("/sort");
    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({});
  });

  it("POST /sort should return 400 if body is invalid", async () => {
    const response = await request(app).post("/sort").send({
      foo: "bar",
    });
    expect(
      await BodySchema.parseAsync((await response.request).body)
    ).toThrow();
    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({});
  });

  it("POST /sort should return 200 if all OK", async () => {
    const body = [2, 3, 1];
    const response = await request(app).post("/sort").send(body);

    const foo = await BodySchema.parseAsync(body)
      .then(() => true)
      .catch((err) => console.log(err));

    expect(foo).toBeTruthy();
    expect(response.status).toBe(200);
    expect(response.body).toEqual([1, 2, 3]);
  });
});
