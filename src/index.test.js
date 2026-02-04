import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "./index.js";

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
