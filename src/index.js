import express from "express";
import { BodySchema } from "./sort.body.schema";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/sort", (req, res) => {
  try {
    BodySchema.parse(req.body);
    res.json(req.body.sort());
  } catch (err) {
    res.sendStatus(400);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
