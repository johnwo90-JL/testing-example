# Testing Example: A Learning-Focused Express.js Project

This repository is a **teaching project** designed to demonstrate best practices for building and testing Node.js REST APIs. It's intentionally small so you can understand every piece.

---

## Table of Contents

1. [What This Project Does](#what-this-project-does)
2. [Technologies Used (and Why)](#technologies-used-and-why)
3. [Project Structure](#project-structure)
4. [Understanding the Code](#understanding-the-code)
   - [The Express Application](#the-express-application)
   - [Input Validation with Zod](#input-validation-with-zod)
   - [The Test Suite](#the-test-suite)
5. [Developer Tooling Explained](#developer-tooling-explained)
6. [Getting Started](#getting-started)
7. [Available Scripts](#available-scripts)

---

## What This Project Does

This is a minimal Express.js REST API with three endpoints:

| Endpoint  | Method | Description                                      |
| --------- | ------ | ------------------------------------------------ |
| `/`       | GET    | Returns a welcome message                        |
| `/health` | GET    | Health check endpoint                            |
| `/sort`   | POST   | Accepts an array of numbers, returns them sorted |

The `/sort` endpoint is the main feature—it demonstrates **input validation**, **error handling**, and **testing patterns**.

---

## Technologies Used (and Why)

### Production Dependencies

| Package        | Purpose           | Why This Choice?                                       |
| -------------- | ----------------- | ------------------------------------------------------ |
| **Express.js** | Web framework     | Industry standard, minimal boilerplate, huge ecosystem |
| **Zod**        | Schema validation | Type-safe validation with excellent error messages     |

### Development Dependencies

| Package         | Purpose             | Why This Choice?                                |
| --------------- | ------------------- | ----------------------------------------------- |
| **Vitest**      | Test runner         | Fast, modern, compatible with Jest API          |
| **Supertest**   | HTTP testing        | Test Express routes without starting a server   |
| **ESLint**      | Code linting        | Catches bugs and enforces consistent style      |
| **Prettier**    | Code formatting     | Eliminates formatting debates, auto-fixes style |
| **Husky**       | Git hooks           | Automates quality checks before commits         |
| **lint-staged** | Staged file linting | Only lint files you're committing (faster)      |

---

## Project Structure

```
testing-example/
├── src/
│   ├── index.js              # Main application
│   ├── index.test.js         # Test suite
│   └── sort.body.schema.js   # Validation schema
├── package.json              # Dependencies and scripts
├── vitest.config.js          # Test configuration
├── eslint.config.js          # Linting rules
├── .prettierrc               # Formatting rules
└── .husky/                   # Git hooks
```

**Why this structure?**

- `src/` keeps source code separate from config files
- Schema in its own file promotes reusability and separation of concerns
- Tests live next to the code they test (`.test.js` suffix)

---

## Understanding the Code

### The Express Application

**File: `src/index.js`**

```javascript
import express from "express";
import { sortBodySchema } from "./sort.body.schema.js";

const app = express();
app.use(express.json()); // Parses JSON request bodies
```

**Key Concept: Middleware**
`express.json()` is middleware that runs before your routes. It parses incoming JSON and makes it available as `req.body`.

#### The Endpoints

**Simple endpoints** return static responses:

```javascript
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/health", (req, res) => {
  res.send("OK");
});
```

**The `/sort` endpoint** demonstrates real-world patterns:

```javascript
app.post("/sort", async (req, res) => {
  try {
    // 1. Validate input against schema
    const items = await sortBodySchema.parseAsync(req.body);

    // 2. Perform business logic
    const sorted = items.toSorted((a, b) => a - b);

    // 3. Return result
    res.json(sorted);
  } catch (error) {
    // 4. Handle validation errors
    console.log(error);
    res.status(400).send("Bad Request");
  }
});
```

**What's happening here:**

1. **`sortBodySchema.parseAsync()`** - Validates `req.body` against our Zod schema. Throws if invalid.
2. **`items.toSorted()`** - Creates a new sorted array (doesn't mutate original). The `(a, b) => a - b` comparator sorts numbers ascending.
3. **`res.json()`** - Sends JSON response with correct `Content-Type` header.
4. **`try/catch`** - Catches validation errors and returns 400 Bad Request.

---

### Input Validation with Zod

**File: `src/sort.body.schema.js`**

```javascript
import { z } from "zod";

export const sortBodySchema = z.array(z.number());
```

**What this means:**

- `z.array()` - The input must be an array
- `z.number()` - Each element must be a number

**Valid inputs:**

```json
[3, 1, 4, 1, 5]
[]
[42]
```

**Invalid inputs (will throw):**

```json
"not an array"
[1, "two", 3]
null
```

**Why Zod?**

Unlike manual validation:

```javascript
// Manual (verbose, error-prone)
if (!Array.isArray(body) || !body.every((x) => typeof x === "number")) {
  throw new Error("Invalid input");
}
```

Zod is:

- Declarative and readable
- Provides detailed error messages
- Type-safe (integrates with TypeScript)
- Composable for complex schemas

---

### The Test Suite

**File: `src/index.test.js`**

Tests use **Vitest** (test runner) and **Supertest** (HTTP assertions).

#### Test Organization

```javascript
describe("Express App", () => {
  it("should be defined", () => {
    /* ... */
  });
  it("GET / should return Hello World!", async () => {
    /* ... */
  });
  it("GET /health should return OK", async () => {
    /* ... */
  });
});

describe("Sorting endpoint", () => {
  it("should return 400 if body is empty", async () => {
    /* ... */
  });
  it("should return 400 if body is not an array of numbers", async () => {
    /* ... */
  });
  it("should sort an array of numbers", async () => {
    /* ... */
  });
});
```

**Key Concept: Describe Blocks**
`describe()` groups related tests. This makes output readable and helps organize logic.

#### Anatomy of a Test

```javascript
it("should sort an array of numbers", async () => {
  // ARRANGE: Set up test data
  const unsorted = [3, 1, 4, 1, 5, 9, 2, 6];

  // ACT: Perform the action
  const response = await request(app).post("/sort").send(unsorted).expect(200); // Assert status code

  // ASSERT: Verify the result
  expect(response.body).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
});
```

**The Arrange-Act-Assert Pattern:**

1. **Arrange** - Set up test data and preconditions
2. **Act** - Execute the code being tested
3. **Assert** - Verify the expected outcome

#### Testing with Supertest

```javascript
const response = await request(app)
  .post("/sort") // HTTP method and path
  .send([3, 1, 2]) // Request body (automatically JSON)
  .expect(200); // Expected status code
```

**Why Supertest?**

- No need to start an actual server
- Chainable API for readable tests
- Built-in assertions for status codes and headers

#### Helper Functions in Tests

```javascript
const expectBadRequest = (response) => {
  expect(response.status).toBe(400);
  expect(response.text).toBe("Bad Request");
};
```

**Why create helpers?**

- **DRY (Don't Repeat Yourself)** - Multiple tests check for 400 errors
- **Consistency** - All error assertions work the same way
- **Maintainability** - Change error format in one place

---

## Developer Tooling Explained

### ESLint (Code Quality)

**File: `eslint.config.js`**

ESLint catches bugs and enforces code style before you run your code.

```javascript
import globals from "globals";
import js from "@eslint/js";
import vitestPlugin from "@vitest/eslint-plugin";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node, // Node.js globals (process, __dirname, etc.)
      },
    },
    rules: {
      "no-console": "off", // Allow console.log in server code
    },
  },
  {
    files: ["**/*.test.js"],
    plugins: { vitest: vitestPlugin },
    languageOptions: {
      globals: vitestPlugin.environments.env.globals, // Vitest globals (describe, it, expect)
    },
  },
];
```

**Key Concepts:**

- **Flat config** - ESLint 9+ uses arrays instead of nested objects
- **Globals** - Variables that exist without being imported (`process`, `describe`, etc.)
- **File-specific rules** - Test files get different treatment than source files

### Prettier (Code Formatting)

**File: `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2
}
```

Prettier automatically formats code so you don't argue about style.

### Husky + lint-staged (Git Hooks)

**What happens when you commit:**

1. Husky intercepts the `git commit` command
2. lint-staged runs on only the files you're committing
3. If linting fails, the commit is blocked
4. You fix the issues and commit again

**Configuration in `package.json`:**

```json
{
  "lint-staged": {
    "*.js": "eslint --fix"
  }
}
```

This means: "For every `.js` file being committed, run ESLint with auto-fix."

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd testing-example

# Install dependencies
npm install
```

### Running the Application

```bash
# Start the server
npm start

# Or with auto-restart on file changes
npm run dev
```

The server runs on `http://localhost:3000` by default.

### Testing the Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Sort numbers
curl -X POST http://localhost:3000/sort \
  -H "Content-Type: application/json" \
  -d "[5, 2, 8, 1, 9]"
```

---

## Available Scripts

| Script                 | Command                     | Description               |
| ---------------------- | --------------------------- | ------------------------- |
| `npm start`            | `node src/index.js`         | Start the server          |
| `npm run dev`          | `node --watch src/index.js` | Start with auto-reload    |
| `npm test`             | `vitest run --silent`       | Run tests (CI mode)       |
| `npm run test:verbose` | `vitest run`                | Run tests with details    |
| `npm run test:watch`   | `vitest --watch`            | Run tests on file changes |
| `npm run lint`         | `eslint .`                  | Check for code issues     |
| `npm run lint:fix`     | `eslint . --fix`            | Auto-fix code issues      |
| `npm run format`       | `prettier --write .`        | Format all files          |
| `npm run format:check` | `prettier --check .`        | Check formatting          |

---

## Learning Exercises

To deepen your understanding, try these:

1. **Add a new endpoint** - Create `POST /reverse` that reverses an array
2. **Enhance validation** - Modify the schema to require at least 2 numbers
3. **Add a test** - Write a test for an array with negative numbers
4. **Custom error messages** - Return Zod's error details instead of "Bad Request"
5. **Add TypeScript** - Convert the project to TypeScript (Zod makes this easy)

---

## Key Takeaways

1. **Validate inputs at the boundary** - Don't trust data from clients
2. **Test the unhappy paths** - Error cases matter as much as success cases
3. **Automate quality checks** - Git hooks catch issues before they're committed
4. **Keep it simple** - This entire API is ~30 lines of code
5. **Separate concerns** - Schema, routes, and tests each have their place
