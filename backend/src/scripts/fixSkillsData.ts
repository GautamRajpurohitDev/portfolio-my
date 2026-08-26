import { connectDB } from "../lib/db";
import { Skill } from "../models/Skill";
import dotenv from "dotenv";

dotenv.config();

const INITIAL_SKILLS = [
  {
    name: "Git & GitHub",
    category: "tools",
    status: "in-progress",
    progress: 89,
    description: "Version control, repositories, branches, commits, merging, rebasing, GitHub workflow.",
    order: 1,
    published: true,
  },
  {
    name: "C",
    category: "programming",
    status: "not-started",
    progress: 0,
    description: "Pointers, memory management, data representation, POSIX basics.",
    order: 2,
    published: true,
  },
  {
    name: "C++",
    category: "programming",
    status: "not-started",
    progress: 0,
    description: "OOP principles, templates, STL, systems programming.",
    order: 3,
    published: true,
  },
  {
    name: "Data Structures",
    category: "cs-fundamentals",
    status: "not-started",
    progress: 0,
    description: "Arrays, linked lists, trees, graphs, heaps, hash tables.",
    order: 4,
    published: true,
  },
  {
    name: "Algorithms",
    category: "cs-fundamentals",
    status: "not-started",
    progress: 0,
    description: "Sorting, searching, recursion, dynamic programming, graph algorithms.",
    order: 5,
    published: true,
  },
  {
    name: "Linux CLI",
    category: "systems",
    status: "not-started",
    progress: 0,
    description: "Shell commands, file system hierarchy, permissions, Bash scripting.",
    order: 6,
    published: true,
  },
  {
    name: "HTML & CSS",
    category: "web",
    status: "not-started",
    progress: 0,
    description: "Semantic HTML5, CSS layout engines, responsive web typography.",
    order: 7,
    published: true,
  },
  {
    name: "JavaScript",
    category: "web",
    status: "not-started",
    progress: 0,
    description: "ES6+, event loop, async/await, closures, DOM manipulation.",
    order: 8,
    published: true,
  },
  {
    name: "React",
    category: "web",
    status: "not-started",
    progress: 0,
    description: "Component architecture, hooks, state management, Next.js.",
    order: 9,
    published: true,
  },
  {
    name: "Node.js & Express",
    category: "web",
    status: "not-started",
    progress: 0,
    description: "REST APIs, middleware, HTTP protocol, authentication.",
    order: 10,
    published: true,
  },
  {
    name: "MongoDB",
    category: "databases",
    status: "not-started",
    progress: 0,
    description: "Document modeling, aggregation pipeline, indexing, Mongoose.",
    order: 11,
    published: true,
  },
  {
    name: "Python",
    category: "programming",
    status: "not-started",
    progress: 0,
    description: "Data handling, scripting, algorithms, automation.",
    order: 12,
    published: true,
  },
  {
    name: "Java",
    category: "programming",
    status: "not-started",
    progress: 0,
    description: "OOP architecture, JVM internals, multithreading.",
    order: 13,
    published: true,
  },
  {
    name: "Cloud & DevOps",
    category: "cloud",
    status: "not-started",
    progress: 0,
    description: "Containerization (Docker), CI/CD workflows, deployment pipelines.",
    order: 14,
    published: true,
  },
  {
    name: "AI & Machine Learning",
    category: "ai-ml",
    status: "not-started",
    progress: 0,
    description: "Math foundations, linear algebra, ML models, neural networks.",
    order: 15,
    published: true,
  },
  {
    name: "Generative AI",
    category: "ai-ml",
    status: "not-started",
    progress: 0,
    description: "LLMs, prompt engineering, RAG architecture, agentic systems.",
    order: 16,
    published: true,
  },
];

async function run() {
  await connectDB();
  console.log("Resetting skills to authentic state...");

  await Skill.deleteMany({});
  await Skill.insertMany(INITIAL_SKILLS);

  console.log("✓ Skills successfully initialized with genuine progress:");
  console.log("  - Git & GitHub: IN PROGRESS (89%)");
  console.log("  - All other skills: NOT STARTED (0%) — No fake completed skills.");

  process.exit(0);
}

run().catch((err) => {
  console.error("Error resetting skills:", err);
  process.exit(1);
});
