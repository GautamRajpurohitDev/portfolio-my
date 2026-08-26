/**
 * seedRoadmap.ts
 *
 * Seeds the Programming Mastery Roadmap into MongoDB.
 * Run once: npx ts-node src/scripts/seedRoadmap.ts
 *
 * Safe to re-run — drops existing roadmap collections first.
 */

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import { RoadmapPhase } from "../models/RoadmapPhase";
import { RoadmapDomain } from "../models/RoadmapDomain";
import { RoadmapTopic } from "../models/RoadmapTopic";
import { RoadmapTask } from "../models/RoadmapTask";

// ── PHASE DEFINITIONS ────────────────────────────────────────

const PHASES = [
  {
    number: 0, order: 0,
    title: "Development Workflow",
    subtitle: "Git & GitHub — Version control from first principles",
    description: "Understand version control properly rather than memorizing commands.",
    overview: "Git is the foundation of all modern software development. Before writing a single line of C or Python, you need to understand how to track your work, collaborate, and maintain a clean history.",
    status: "in-progress" as const,
    progress: 89,
    icon: "GitBranch",
    color: "#e8c547",
    domains: [
      {
        title: "Git & GitHub",
        description: "Version control and remote collaboration using Git and GitHub.",
        status: "in-progress" as const,
        progress: 89,
        icon: "GitBranch",
        order: 0,
        topics: [
          { title: "Git Mental Model", subtopics: ["Repository", "Working directory", "Staging area", "Commit", "Local repository", "Remote repository"] },
          { title: "Core Commands", subtopics: ["status", "add", "commit", "log", "diff", "restore", "push", "pull", "clone", "fetch"] },
          { title: "Branching & Merging", subtopics: ["branch", "merge", "rebase", "stash", "tags"] },
          { title: "Remote Workflow", subtopics: ["origin", "main", "remote", "GitHub workflow", "pull requests", "issues"] },
          { title: "Repository Management", subtopics: ["README", ".gitignore", "commit discipline"] },
        ],
      },
    ],
  },
  {
    number: 1, order: 1,
    title: "Problem Solving Foundations",
    subtitle: "Pseudocode — Thinking before coding",
    description: "Learn to think through problems before touching a keyboard.",
    overview: "Pseudocode is not a separate long-term specialisation. It should be learned and practiced alongside early programming as the bridge between problem and solution.",
    status: "not-started" as const,
    progress: 0,
    icon: "Brain",
    color: "#6366f1",
    domains: [
      {
        title: "Pseudocode",
        description: "Structured problem thinking using pseudocode before implementation.",
        status: "not-started" as const,
        progress: 0,
        icon: "FileText",
        order: 0,
        topics: [
          { title: "Pseudocode Syntax", subtopics: ["START / END", "INPUT / OUTPUT", "variables", "assignment", "conditions", "IF / ELSE", "nested conditions"] },
          { title: "Pseudocode Loops", subtopics: ["FOR", "WHILE", "DO-WHILE"] },
          { title: "Pseudocode Functions", subtopics: ["functions", "parameters", "return values", "basic algorithms", "dry runs", "flow of logic"] },
          { title: "Problem-Solving Process", subtopics: ["Understand requirements", "Write pseudocode", "Dry run", "Implement", "Test", "Debug", "Git commit"] },
        ],
      },
    ],
  },
  {
    number: 2, order: 2,
    title: "Mathematics for Programming",
    subtitle: "Foundations — Logic, numbers, and discrete math",
    description: "The mathematical foundations required for programming and later for AI/ML.",
    overview: "Mathematics is learned in two layers: foundational mathematics for general programming, and advanced mathematics for AI/ML. Do not imply that everything must be mastered before programming begins.",
    status: "not-started" as const,
    progress: 0,
    icon: "Calculator",
    color: "#10b981",
    domains: [
      {
        title: "Mathematics for Programming",
        description: "Core maths needed for programming fundamentals and algorithms.",
        status: "not-started" as const,
        progress: 0,
        icon: "Hash",
        order: 0,
        topics: [
          { title: "Arithmetic & Algebra", subtopics: ["Arithmetic", "Algebra", "Functions", "Equations", "Inequalities", "Exponents", "Logarithms", "Ratios", "Percentages"] },
          { title: "Sequences & Probability", subtopics: ["Sequences", "Series", "Basic probability", "Statistics", "Permutations", "Combinations"] },
          { title: "Logic & Number Theory", subtopics: ["Set theory", "Logic", "Number theory basics", "Modular arithmetic", "Boolean logic"] },
          { title: "Discrete Mathematics", subtopics: ["Discrete mathematics", "Graphs", "Relations"] },
        ],
      },
      {
        title: "Mathematics for AI/ML",
        description: "Advanced mathematics supporting machine learning and AI — studied later.",
        status: "not-started" as const,
        progress: 0,
        icon: "TrendingUp",
        order: 1,
        topics: [
          { title: "Linear Algebra", subtopics: ["Vectors", "Matrices", "Matrix operations", "Linear algebra"] },
          { title: "Calculus & Optimization", subtopics: ["Derivatives", "Gradients", "Basic calculus", "Optimization basics"] },
          { title: "Statistics & Probability", subtopics: ["Probability distributions", "Statistics"] },
        ],
      },
    ],
  },
  {
    number: 3, order: 3,
    title: "Aptitude",
    subtitle: "Parallel track — Placement and interview preparation",
    description: "Quantitative, logical, and verbal aptitude for placements and interviews.",
    overview: "This is a parallel track running alongside the main technical roadmap. It targets placement exams, competitive tests, and interviews.",
    status: "not-started" as const,
    progress: 0,
    icon: "Trophy",
    color: "#f59e0b",
    domains: [
      {
        title: "Quantitative Aptitude",
        description: "Numerical ability and problem solving.",
        status: "not-started" as const,
        progress: 0,
        icon: "BarChart",
        order: 0,
        topics: [
          { title: "Arithmetic", subtopics: ["Percentages", "Ratios", "Proportions", "Averages", "Profit and loss", "Simple interest", "Compound interest"] },
          { title: "Time & Work", subtopics: ["Time and work", "Time speed distance"] },
          { title: "Combinatorics", subtopics: ["Probability", "Permutations", "Combinations", "Number systems", "Algebra", "Data interpretation"] },
        ],
      },
      {
        title: "Logical Reasoning",
        description: "Pattern recognition and structured logic.",
        status: "not-started" as const,
        progress: 0,
        icon: "Puzzle",
        order: 1,
        topics: [
          { title: "Patterns & Sequences", subtopics: ["Patterns", "Sequences", "Coding-decoding", "Blood relations", "Directions"] },
          { title: "Logic", subtopics: ["Syllogisms", "Statements", "Logical puzzles", "Arrangements"] },
        ],
      },
      {
        title: "Verbal Ability",
        description: "English language skills for aptitude tests.",
        status: "not-started" as const,
        progress: 0,
        icon: "BookOpen",
        order: 2,
        topics: [
          { title: "Verbal Skills", subtopics: ["Grammar", "Vocabulary", "Reading comprehension", "Sentence correction", "Para jumbles", "Critical reasoning"] },
        ],
      },
    ],
  },
  {
    number: 4, order: 4,
    title: "C Programming",
    subtitle: "Memory, compilation, and the foundation of systems thinking",
    description: "Learn C deeply — not just syntax, but memory, pointers, compilation, and the way computers actually work.",
    overview: "C is the language that teaches you how computers really work. The goal is not just to learn C but to build a mental model of memory, the stack, heap, pointers, and compilation.",
    status: "not-started" as const,
    progress: 0,
    icon: "Code2",
    color: "#3b82f6",
    domains: [
      {
        title: "C Programming",
        description: "Complete C programming from structure to dynamic memory.",
        status: "not-started" as const,
        progress: 0,
        icon: "Terminal",
        order: 0,
        topics: [
          { title: "Program Fundamentals", subtopics: ["Program structure", "Variables", "Constants", "Data types", "Input/output", "Operators", "Type conversion"] },
          { title: "Control Flow", subtopics: ["if / else", "switch", "for", "while", "do-while", "break", "continue"] },
          { title: "Functions & Recursion", subtopics: ["Functions", "Recursion", "Parameters", "Return values", "Scope"] },
          { title: "Arrays & Strings", subtopics: ["Arrays", "Strings", "String functions", "Multi-dimensional arrays"] },
          { title: "Pointers & Memory", subtopics: ["Pointers", "Pointer arithmetic", "Stack", "Heap", "Addresses", "References through pointers", "Dynamic memory", "malloc", "calloc", "free"] },
          { title: "Structures & Files", subtopics: ["Structures", "Unions", "File handling", "Debugging"] },
          { title: "C Compilation Model", subtopics: ["Compilation", "Linking", "Preprocessor", "Header files", "Makefiles"] },
        ],
      },
    ],
  },
  {
    number: 5, order: 5,
    title: "C++",
    subtitle: "OOP and the primary DSA language",
    description: "C++ as an extension of C with full OOP and the STL for DSA practice.",
    overview: "The goal is to use C++ as the primary language for DSA practice. Master both the OOP fundamentals and the STL containers and algorithms.",
    status: "not-started" as const,
    progress: 0,
    icon: "Code2",
    color: "#8b5cf6",
    domains: [
      {
        title: "C++ Programming",
        description: "From C++ syntax through OOP to Modern C++ and STL.",
        status: "not-started" as const,
        progress: 0,
        icon: "Cpu",
        order: 0,
        topics: [
          { title: "C++ Foundations", subtopics: ["Syntax", "Variables", "I/O", "Control flow", "Functions", "Arrays", "Strings", "Pointers", "References"] },
          { title: "Object-Oriented Programming", subtopics: ["Classes", "Objects", "Constructors", "Destructors", "Encapsulation", "Inheritance", "Polymorphism", "Abstraction"] },
          { title: "STL Containers", subtopics: ["Vector", "String", "Map", "Set", "Stack", "Queue", "Deque", "Priority queue", "Iterators"] },
          { title: "Modern C++", subtopics: ["Templates", "Smart pointers", "Exception handling", "Lambdas", "Range-based for", "Auto"] },
          { title: "STL Algorithms", subtopics: ["sort", "binary_search", "lower_bound", "upper_bound", "find", "count", "reverse", "accumulate"] },
        ],
      },
    ],
  },
  {
    number: 6, order: 6,
    title: "Data Structures & Algorithms",
    subtitle: "The core of technical interviews and systems thinking",
    description: "Systematic DSA practice from complexity analysis through advanced graph algorithms.",
    overview: "DSA is the foundation of software engineering interviews and real system design. Work through easy → medium → hard. Track problems solved honestly — do not fake counts.",
    status: "not-started" as const,
    progress: 0,
    icon: "Network",
    color: "#ef4444",
    domains: [
      {
        title: "Foundations",
        description: "Complexity analysis, recursion, and search/sort.",
        status: "not-started" as const,
        progress: 0,
        icon: "Sigma",
        order: 0,
        topics: [
          { title: "Complexity Analysis", subtopics: ["Big O", "Big Theta", "Big Omega", "Time complexity", "Space complexity", "Amortized analysis"] },
          { title: "Recursion", subtopics: ["Base cases", "Recursive calls", "Call stack", "Tail recursion", "Memoization intro"] },
          { title: "Searching & Sorting", subtopics: ["Linear search", "Binary search", "Bubble sort", "Selection sort", "Insertion sort", "Merge sort", "Quick sort", "Heap sort"] },
        ],
      },
      {
        title: "Data Structures",
        description: "All core data structures from arrays to tries.",
        status: "not-started" as const,
        progress: 0,
        icon: "Database",
        order: 1,
        topics: [
          { title: "Linear Structures", subtopics: ["Arrays", "Strings", "Linked lists (singly)", "Linked lists (doubly)", "Circular linked list", "Stacks", "Queues", "Deques"] },
          { title: "Hash-Based Structures", subtopics: ["Hash tables", "Hash functions", "Collision resolution", "Sets", "Maps"] },
          { title: "Trees", subtopics: ["Binary trees", "BST", "AVL trees", "Heaps", "Priority queues", "Segment trees", "Fenwick trees"] },
          { title: "Graphs", subtopics: ["Representations", "Adjacency matrix", "Adjacency list", "Weighted graphs", "Directed graphs"] },
          { title: "Advanced", subtopics: ["Tries", "Disjoint sets", "Union-Find"] },
        ],
      },
      {
        title: "Algorithms",
        description: "All algorithm paradigms with problem practice.",
        status: "not-started" as const,
        progress: 0,
        icon: "Zap",
        order: 2,
        topics: [
          { title: "Two Pointers & Sliding Window", subtopics: ["Two pointers pattern", "Sliding window fixed", "Sliding window variable", "Prefix sums"] },
          { title: "Backtracking", subtopics: ["Backtracking template", "Subsets", "Permutations", "N-Queens", "Sudoku"] },
          { title: "Divide and Conquer", subtopics: ["Merge sort pattern", "Binary search variants", "Quick select"] },
          { title: "Greedy Algorithms", subtopics: ["Greedy choice property", "Activity selection", "Huffman coding", "Interval scheduling"] },
          { title: "Dynamic Programming", subtopics: ["Memoization", "Tabulation", "1D DP", "2D DP", "Knapsack", "LCS", "LIS", "Coin change"] },
          { title: "Graph Algorithms", subtopics: ["BFS", "DFS", "Dijkstra", "Bellman-Ford", "Floyd-Warshall", "Topological sort", "Kruskal", "Prim"] },
        ],
      },
      {
        title: "Problem Practice Milestones",
        description: "Tracked problem solving — never fake counts.",
        status: "not-started" as const,
        progress: 0,
        icon: "Target",
        order: 3,
        topics: [
          { title: "Problem Milestones", subtopics: ["25 problems", "50 problems", "100 problems", "250 problems", "500 problems", "1000 problems"] },
        ],
      },
    ],
  },
  {
    number: 7, order: 7,
    title: "Computer Science",
    subtitle: "DBMS, OOP, OS, Networks, Architecture",
    description: "Core CS theory that every professional software engineer must understand.",
    overview: "These are the foundational computer science subjects: DBMS, OOP principles, Operating Systems, Computer Networks, and Computer Architecture. They underpin everything from web dev to cloud to systems.",
    status: "not-started" as const,
    progress: 0,
    icon: "Monitor",
    color: "#06b6d4",
    domains: [
      {
        title: "DBMS",
        description: "Database Management Systems — relational theory and SQL.",
        status: "not-started" as const,
        progress: 0,
        icon: "Database",
        order: 0,
        topics: [
          { title: "Relational Model", subtopics: ["Data models", "Relational model", "Tables", "Keys", "Constraints"] },
          { title: "SQL", subtopics: ["DDL", "DML", "DQL", "Joins", "Subqueries", "Aggregate functions", "Views", "Stored procedures"] },
          { title: "Transactions & ACID", subtopics: ["Transactions", "ACID", "Concurrency", "Locks", "Deadlocks in DB"] },
          { title: "Normalization", subtopics: ["1NF", "2NF", "3NF", "BCNF", "Decomposition"] },
          { title: "Indexing & Optimization", subtopics: ["Indexes", "B-trees", "Query optimization", "Execution plans"] },
        ],
      },
      {
        title: "ADBMS",
        description: "Advanced Database — distributed systems, NoSQL, CAP theorem.",
        status: "not-started" as const,
        progress: 0,
        icon: "Server",
        order: 1,
        topics: [
          { title: "Distributed Databases", subtopics: ["Replication", "Sharding", "Distributed transactions"] },
          { title: "NoSQL", subtopics: ["Document databases", "Key-value databases", "Column stores", "Graph databases"] },
          { title: "CAP Theorem", subtopics: ["Consistency", "Availability", "Partition tolerance", "BASE vs ACID"] },
        ],
      },
      {
        title: "OOP",
        description: "Object-Oriented Programming principles and SOLID.",
        status: "not-started" as const,
        progress: 0,
        icon: "Boxes",
        order: 2,
        topics: [
          { title: "OOP Principles", subtopics: ["Classes", "Objects", "Encapsulation", "Inheritance", "Polymorphism", "Abstraction"] },
          { title: "Design Principles", subtopics: ["SOLID", "DRY", "YAGNI", "KISS", "Coupling", "Cohesion"] },
          { title: "Design Patterns", subtopics: ["Singleton", "Factory", "Observer", "Strategy", "Decorator", "Adapter"] },
        ],
      },
      {
        title: "Operating Systems",
        description: "Processes, memory management, concurrency, and file systems.",
        status: "not-started" as const,
        progress: 0,
        icon: "Cpu",
        order: 3,
        topics: [
          { title: "Processes & Threads", subtopics: ["Processes", "Threads", "Process states", "PCB", "Context switching"] },
          { title: "Scheduling", subtopics: ["FCFS", "SJF", "Round Robin", "Priority scheduling", "Multilevel queues"] },
          { title: "Memory Management", subtopics: ["Virtual memory", "Paging", "Segmentation", "Page replacement algorithms", "TLB"] },
          { title: "Concurrency", subtopics: ["Deadlocks", "Mutual exclusion", "Semaphores", "Monitors", "Synchronization"] },
          { title: "File Systems & I/O", subtopics: ["File systems", "System calls", "I/O scheduling", "Disk management"] },
        ],
      },
      {
        title: "Computer Networks",
        description: "OSI, TCP/IP, protocols, and networking fundamentals.",
        status: "not-started" as const,
        progress: 0,
        icon: "Network",
        order: 4,
        topics: [
          { title: "Network Models", subtopics: ["OSI model", "TCP/IP model", "Layer functions", "Encapsulation"] },
          { title: "Protocols", subtopics: ["IP", "MAC", "ARP", "DNS", "DHCP", "HTTP", "HTTPS", "TCP", "UDP"] },
          { title: "Routing & Switching", subtopics: ["Routing", "Switching", "NAT", "Firewalls", "Subnetting", "CIDR"] },
          { title: "Application Layer", subtopics: ["Sockets", "HTTP/1.1", "HTTP/2", "WebSockets", "TLS/SSL"] },
        ],
      },
    ],
  },
  {
    number: 8, order: 8,
    title: "Java",
    subtitle: "OOP-first language and ecosystem",
    description: "Java as a strongly-typed OOP language with rich ecosystem and JDBC for database integration.",
    overview: "Learn Java as a second language after C/C++. Focus on the ecosystem: JVM, Collections, Streams, Concurrency, and JDBC for real database-connected applications.",
    status: "not-started" as const,
    progress: 0,
    icon: "Coffee",
    color: "#f97316",
    domains: [
      {
        title: "Java",
        description: "Core Java through advanced Java ecosystem.",
        status: "not-started" as const,
        progress: 0,
        icon: "Layers",
        order: 0,
        topics: [
          { title: "Core Java", subtopics: ["Syntax", "Variables", "Data types", "Control flow", "Methods", "Arrays", "Strings"] },
          { title: "Java OOP", subtopics: ["Classes", "Objects", "Inheritance", "Polymorphism", "Interfaces", "Abstract classes", "Encapsulation"] },
          { title: "Java Ecosystem", subtopics: ["Collections", "Generics", "Exceptions", "Streams", "Lambdas", "JVM", "JDK", "JRE", "Memory model", "Garbage collection"] },
          { title: "Threads & Concurrency", subtopics: ["Threads", "Runnable", "Callable", "Synchronized", "Locks", "ExecutorService", "CompletableFuture"] },
          { title: "JDBC", subtopics: ["JDBC", "Connection", "PreparedStatement", "ResultSet", "Transactions"] },
        ],
      },
    ],
  },
  {
    number: 9, order: 9,
    title: "Python",
    subtitle: "The language of automation, data, and AI",
    description: "Python as the primary language for AI/ML, automation, data processing, and backend scripting.",
    overview: "Python becomes a major language later in the roadmap for AI/ML, automation, data work, backend development, and security tooling.",
    status: "not-started" as const,
    progress: 0,
    icon: "Braces",
    color: "#eab308",
    domains: [
      {
        title: "Python",
        description: "Fundamentals through advanced Python including OOP, ecosystem and tooling.",
        status: "not-started" as const,
        progress: 0,
        icon: "Code2",
        order: 0,
        topics: [
          { title: "Python Fundamentals", subtopics: ["Syntax", "Variables", "Data types", "Conditions", "Loops", "Functions", "Modules", "Packages", "Exceptions", "Files"] },
          { title: "Python OOP", subtopics: ["Classes", "Objects", "Inheritance", "Polymorphism", "Dunder methods", "Properties"] },
          { title: "Advanced Python", subtopics: ["Decorators", "Generators", "Iterators", "Context managers", "Comprehensions"] },
          { title: "Python Ecosystem", subtopics: ["Virtual environments", "pip", "Testing (pytest)", "APIs", "Automation", "CLI tools", "Type hints"] },
        ],
      },
    ],
  },
  {
    number: 10, order: 10,
    title: "Web Development",
    subtitle: "HTML → CSS → JavaScript → React → Node → Express → MongoDB → MERN",
    description: "Full-stack web development from HTML foundations to production MERN applications.",
    overview: "Web Development progresses from frontend fundamentals to full-stack MERN. MongoDB is covered here as a document database within the MERN context (advanced database concepts covered in ADBMS).",
    status: "not-started" as const,
    progress: 0,
    icon: "Globe",
    color: "#22c55e",
    domains: [
      {
        title: "HTML",
        description: "Semantic HTML, forms, accessibility, and SEO fundamentals.",
        status: "not-started" as const,
        progress: 0,
        icon: "FileCode",
        order: 0,
        topics: [
          { title: "HTML Foundations", subtopics: ["Semantics", "Document structure", "Forms", "Accessibility", "SEO fundamentals", "Meta tags", "Links and images"] },
        ],
      },
      {
        title: "CSS",
        description: "Modern CSS layout and design.",
        status: "not-started" as const,
        progress: 0,
        icon: "Palette",
        order: 1,
        topics: [
          { title: "CSS Fundamentals", subtopics: ["Selectors", "Box model", "Specificity", "Cascade"] },
          { title: "CSS Layout", subtopics: ["Flexbox", "Grid", "Responsive design", "Media queries", "Container queries"] },
          { title: "CSS Advanced", subtopics: ["Animations", "Transitions", "Custom properties", "Pseudo-elements"] },
        ],
      },
      {
        title: "JavaScript",
        description: "Core JavaScript through modern ES6+ and async programming.",
        status: "not-started" as const,
        progress: 0,
        icon: "Zap",
        order: 2,
        topics: [
          { title: "JavaScript Core", subtopics: ["Variables", "Functions", "Objects", "Arrays", "Scope", "Closures", "Prototypes"] },
          { title: "DOM & Events", subtopics: ["DOM manipulation", "Events", "Event delegation", "Forms"] },
          { title: "Async JavaScript", subtopics: ["Callbacks", "Promises", "async/await", "Fetch API", "Error handling"] },
          { title: "Modern JavaScript", subtopics: ["ES6+", "Modules", "Destructuring", "Spread/Rest", "Map/Set", "Optional chaining"] },
        ],
      },
      {
        title: "React",
        description: "Component-based UI with hooks and state management.",
        status: "not-started" as const,
        progress: 0,
        icon: "Atom",
        order: 3,
        topics: [
          { title: "React Fundamentals", subtopics: ["Components", "Props", "State", "JSX", "Conditional rendering"] },
          { title: "React Hooks", subtopics: ["useState", "useEffect", "useRef", "useContext", "useMemo", "useCallback", "Custom hooks"] },
          { title: "React Patterns", subtopics: ["Forms", "Routing", "Context", "Performance", "Reusable UI", "Error boundaries"] },
        ],
      },
      {
        title: "Node.js",
        description: "Server-side JavaScript runtime.",
        status: "not-started" as const,
        progress: 0,
        icon: "Server",
        order: 4,
        topics: [
          { title: "Node.js Fundamentals", subtopics: ["Node runtime", "Event loop", "Modules (CommonJS)", "ES Modules", "npm", "File system", "Path", "Streams"] },
          { title: "Async Node.js", subtopics: ["Callbacks", "Promises", "async/await", "Event emitter"] },
        ],
      },
      {
        title: "Express.js",
        description: "Backend REST API with Express.",
        status: "not-started" as const,
        progress: 0,
        icon: "Route",
        order: 5,
        topics: [
          { title: "Express Fundamentals", subtopics: ["Routing", "Middleware", "Request/Response", "Static files", "Error handling"] },
          { title: "API Development", subtopics: ["REST principles", "CRUD operations", "Validation", "Authentication", "Authorization", "JWT", "Cookies", "Rate limiting"] },
        ],
      },
      {
        title: "MongoDB",
        description: "Document database used in MERN stack applications.",
        status: "not-started" as const,
        progress: 0,
        icon: "Database",
        order: 6,
        topics: [
          { title: "MongoDB Fundamentals", subtopics: ["Documents", "Collections", "BSON", "CRUD operations", "Queries", "Operators"] },
          { title: "MongoDB Advanced", subtopics: ["Indexes", "Aggregation pipeline", "Schema design", "Embedded vs referenced documents"] },
          { title: "Mongoose", subtopics: ["Schema", "Model", "Validation", "Middleware (hooks)", "Populate", "Virtuals"] },
        ],
      },
      {
        title: "MERN Stack",
        description: "Full-stack integration: MongoDB + Express + React + Node.js",
        status: "not-started" as const,
        progress: 0,
        icon: "Layers",
        order: 7,
        topics: [
          { title: "MERN Integration", subtopics: ["Project structure", "API integration", "State management", "Authentication flow", "File uploads", "Environment configuration"] },
          { title: "MERN Projects", subtopics: ["Frontend project", "REST API project", "Authentication project", "Full-stack MERN project"] },
        ],
      },
    ],
  },
  {
    number: 11, order: 11,
    title: "Linux",
    subtitle: "The foundation of servers, cloud, and systems",
    description: "Linux as the operating environment for production systems, cloud, and security work.",
    overview: "Linux is not optional for a software engineer. It is the foundation of servers, cloud platforms, and cybersecurity. Learn it hands-on.",
    status: "not-started" as const,
    progress: 0,
    icon: "Terminal",
    color: "#64748b",
    domains: [
      {
        title: "Linux",
        description: "Linux fundamentals through system administration.",
        status: "not-started" as const,
        progress: 0,
        icon: "Terminal",
        order: 0,
        topics: [
          { title: "Linux Filesystem", subtopics: ["Filesystem hierarchy", "Permissions", "Users", "Groups", "File types", "Hard links", "Soft links"] },
          { title: "Core Commands", subtopics: ["ls", "cd", "pwd", "cp", "mv", "rm", "mkdir", "cat", "grep", "find", "chmod", "chown", "ps", "top", "kill", "curl", "wget", "ssh"] },
          { title: "Processes & Services", subtopics: ["Processes", "Services", "systemd", "Package management (apt/yum/dnf)", "Cron jobs"] },
          { title: "Shell & Bash", subtopics: ["Shell", "Bash scripting", "Variables", "Conditionals", "Loops", "Functions", "I/O redirection", "Piping"] },
          { title: "Networking & Remote", subtopics: ["SSH", "Networking tools", "Logs", "System administration basics"] },
        ],
      },
    ],
  },
  {
    number: 12, order: 12,
    title: "Cloud",
    subtitle: "AWS, Docker, CI/CD, and production deployment",
    description: "Deploy production applications on cloud infrastructure using AWS and containers.",
    overview: "Cloud is the operating environment of modern software. Learn the core AWS services, containerization with Docker, and CI/CD pipelines to deploy real applications.",
    status: "not-started" as const,
    progress: 0,
    icon: "Cloud",
    color: "#0ea5e9",
    domains: [
      {
        title: "Cloud Concepts",
        description: "IaaS, PaaS, SaaS, virtualization, and containers.",
        status: "not-started" as const,
        progress: 0,
        icon: "Cloud",
        order: 0,
        topics: [
          { title: "Cloud Foundations", subtopics: ["IaaS", "PaaS", "SaaS", "Virtualization", "Containers vs VMs", "Cloud providers"] },
        ],
      },
      {
        title: "AWS",
        description: "Core Amazon Web Services.",
        status: "not-started" as const,
        progress: 0,
        icon: "Server",
        order: 1,
        topics: [
          { title: "AWS Core Services", subtopics: ["IAM", "EC2", "S3", "VPC", "RDS", "CloudFront", "Route 53", "CloudWatch"] },
        ],
      },
      {
        title: "Docker",
        description: "Containers from images to compose.",
        status: "not-started" as const,
        progress: 0,
        icon: "Package",
        order: 2,
        topics: [
          { title: "Docker Fundamentals", subtopics: ["Images", "Containers", "Dockerfile", "Volumes", "Networks", "Docker Compose"] },
        ],
      },
      {
        title: "Deployment & CI/CD",
        description: "Production deployment pipeline.",
        status: "not-started" as const,
        progress: 0,
        icon: "GitBranch",
        order: 3,
        topics: [
          { title: "CI/CD Pipeline", subtopics: ["GitHub Actions", "Environment variables", "Secrets", "Reverse proxy (nginx)", "HTTPS/TLS", "Zero-downtime deployment"] },
        ],
      },
    ],
  },
  {
    number: 13, order: 13,
    title: "Cybersecurity",
    subtitle: "Ethical practice in controlled environments only",
    description: "Security foundations, web security, network security, cryptography, and Linux hardening.",
    overview: "Only use legal environments: CTFs, labs, test systems, and intentionally vulnerable applications. Never practice on systems you do not own.",
    status: "not-started" as const,
    progress: 0,
    icon: "Shield",
    color: "#dc2626",
    domains: [
      {
        title: "Security Foundations",
        description: "CIA triad, threat modeling, and security principles.",
        status: "not-started" as const,
        progress: 0,
        icon: "Lock",
        order: 0,
        topics: [
          { title: "Security Principles", subtopics: ["CIA triad", "Authentication", "Authorization", "Threat modeling", "Risk assessment", "Defense in depth"] },
        ],
      },
      {
        title: "Web Security",
        description: "OWASP Top 10 and application security.",
        status: "not-started" as const,
        progress: 0,
        icon: "Globe",
        order: 1,
        topics: [
          { title: "OWASP Top 10", subtopics: ["XSS", "CSRF", "SQL injection", "Authentication flaws", "Authorization flaws", "Session security", "File upload security", "API security"] },
        ],
      },
      {
        title: "Network Security",
        description: "Firewalls, TLS, VPN, and network segmentation.",
        status: "not-started" as const,
        progress: 0,
        icon: "Network",
        order: 2,
        topics: [
          { title: "Network Security", subtopics: ["Firewalls", "TLS", "HTTPS", "VPN", "Network segmentation", "Intrusion detection"] },
        ],
      },
      {
        title: "Linux Security",
        description: "Hardening Linux systems.",
        status: "not-started" as const,
        progress: 0,
        icon: "Terminal",
        order: 3,
        topics: [
          { title: "Linux Hardening", subtopics: ["Permissions", "Process security", "Logs and auditing", "SSH hardening", "fail2ban", "UFW"] },
        ],
      },
      {
        title: "Cryptography",
        description: "Hashing, encryption, and digital signatures.",
        status: "not-started" as const,
        progress: 0,
        icon: "Key",
        order: 4,
        topics: [
          { title: "Cryptography Fundamentals", subtopics: ["Hashing", "Encryption", "Symmetric encryption", "Asymmetric encryption", "Digital signatures", "Certificates", "PKI"] },
        ],
      },
    ],
  },
  {
    number: 14, order: 14,
    title: "AI / Machine Learning",
    subtitle: "From regression to deep learning with PyTorch",
    description: "Mathematical prerequisites, Python ecosystem, classical ML, and deep learning.",
    overview: "AI/ML builds on linear algebra, probability, statistics, and Python. Work through classical algorithms before deep learning.",
    status: "not-started" as const,
    progress: 0,
    icon: "Brain",
    color: "#a855f7",
    domains: [
      {
        title: "Python ML Ecosystem",
        description: "NumPy, Pandas, Matplotlib — the data science trio.",
        status: "not-started" as const,
        progress: 0,
        icon: "Package",
        order: 0,
        topics: [
          { title: "NumPy", subtopics: ["Arrays", "Operations", "Broadcasting", "Indexing", "Linear algebra with NumPy"] },
          { title: "Pandas", subtopics: ["DataFrames", "Series", "Loading data", "Cleaning", "Aggregation", "Merging"] },
          { title: "Matplotlib & Seaborn", subtopics: ["Line plots", "Scatter plots", "Histograms", "Heatmaps", "Styling"] },
        ],
      },
      {
        title: "Machine Learning",
        description: "Classical ML algorithms and model evaluation.",
        status: "not-started" as const,
        progress: 0,
        icon: "TrendingUp",
        order: 1,
        topics: [
          { title: "ML Workflow", subtopics: ["Regression", "Classification", "Clustering", "Feature engineering", "Training", "Validation", "Testing", "Overfitting", "Underfitting", "Metrics", "Cross-validation"] },
          { title: "ML Algorithms", subtopics: ["Linear regression", "Logistic regression", "Decision trees", "Random forests", "KNN", "SVM", "K-means", "Naive Bayes", "Gradient boosting"] },
        ],
      },
      {
        title: "Deep Learning",
        description: "Neural networks through transformers with PyTorch.",
        status: "not-started" as const,
        progress: 0,
        icon: "Layers",
        order: 2,
        topics: [
          { title: "Neural Networks", subtopics: ["Neural networks", "Activation functions", "Loss functions", "Backpropagation", "Optimizers", "Regularization"] },
          { title: "Deep Learning Architectures", subtopics: ["CNN", "RNN", "LSTM", "Transformers", "Attention mechanism"] },
          { title: "PyTorch", subtopics: ["Tensors", "Autograd", "nn.Module", "DataLoader", "Training loop", "Saving models"] },
        ],
      },
    ],
  },
  {
    number: 15, order: 15,
    title: "Generative AI",
    subtitle: "LLMs, RAG, agents, and AI product engineering",
    description: "Building on top of large language models — prompting, RAG, agents, and production AI systems.",
    overview: "Generative AI is the frontier. Learn the foundations (LLMs, transformers, embeddings) then build real applications including RAG systems and AI agents.",
    status: "not-started" as const,
    progress: 0,
    icon: "Sparkles",
    color: "#ec4899",
    domains: [
      {
        title: "Foundations",
        description: "LLMs, transformers, tokens, and embeddings.",
        status: "not-started" as const,
        progress: 0,
        icon: "BookOpen",
        order: 0,
        topics: [
          { title: "LLM Fundamentals", subtopics: ["LLMs", "Transformers", "Tokens", "Embeddings", "Attention mechanism", "Context window", "Temperature"] },
        ],
      },
      {
        title: "GenAI Applications",
        description: "Prompting, RAG, agents, and structured output.",
        status: "not-started" as const,
        progress: 0,
        icon: "Zap",
        order: 1,
        topics: [
          { title: "Prompting", subtopics: ["Prompting techniques", "Structured output", "Function calling", "System prompts"] },
          { title: "RAG", subtopics: ["RAG pipeline", "Vector databases", "Semantic search", "Chunking", "Retrieval strategies"] },
          { title: "Agents", subtopics: ["Agents", "Tool use", "Multi-step reasoning", "Memory", "Orchestration"] },
          { title: "Evaluation", subtopics: ["Evaluation frameworks", "Guardrails", "Hallucination detection", "RAGAS"] },
        ],
      },
      {
        title: "GenAI Systems",
        description: "Production AI system engineering.",
        status: "not-started" as const,
        progress: 0,
        icon: "Server",
        order: 2,
        topics: [
          { title: "Production AI Systems", subtopics: ["Model APIs", "Inference", "Caching", "Streaming", "Observability", "Cost management"] },
        ],
      },
    ],
  },
  {
    number: 16, order: 16,
    title: "Advanced Software Engineering",
    subtitle: "Systems, architecture, and engineering at scale",
    description: "Software engineering principles, system design, and distributed systems.",
    overview: "The capstone phase covering professional software engineering practices, system design for scale, and the foundations of distributed systems.",
    status: "not-started" as const,
    progress: 0,
    icon: "Settings",
    color: "#475569",
    isOptional: false,
    domains: [
      {
        title: "Software Engineering",
        description: "Requirements, architecture, testing, CI/CD, and code quality.",
        status: "not-started" as const,
        progress: 0,
        icon: "Wrench",
        order: 0,
        topics: [
          { title: "Engineering Practices", subtopics: ["Requirements", "Architecture", "Design patterns", "Testing (unit, integration, e2e)", "Documentation", "Logging", "Monitoring", "CI/CD", "Versioning", "Code quality", "Code review"] },
        ],
      },
      {
        title: "System Design",
        description: "Scalability, caching, queues, and distributed system fundamentals.",
        status: "not-started" as const,
        progress: 0,
        icon: "Network",
        order: 1,
        topics: [
          { title: "System Design Fundamentals", subtopics: ["Scalability", "Load balancing", "Caching", "Queues", "Messaging", "Replication", "Sharding", "Consistency", "Availability", "Fault tolerance"] },
          { title: "Distributed Systems", subtopics: ["Distributed systems", "Microservices", "Event-driven architecture", "Service mesh", "API gateway"] },
        ],
      },
    ],
  },
];

// ── SEED FUNCTION ─────────────────────────────────────────────

async function seed() {
  console.log("\n🌱 Seeding Programming Mastery Roadmap...\n");

  await connectDB();

  // Clear existing roadmap data
  console.log("🗑️  Clearing existing roadmap data...");
  await RoadmapTask.deleteMany({});
  await RoadmapTopic.deleteMany({});
  await RoadmapDomain.deleteMany({});
  await RoadmapPhase.deleteMany({});
  console.log("   ✓ Collections cleared\n");

  let totalDomains = 0;
  let totalTopics  = 0;

  for (const phaseData of PHASES) {
    const { domains, ...phaseFields } = phaseData as any;

    // Create phase
    const phase = await RoadmapPhase.create(phaseFields);
    console.log(`✅ Phase ${String(phase.number).padStart(2, "0")} — ${phase.title}  [${phase.status}] (${phase.progress}%)`);

    for (const domainData of domains) {
      const { topics, ...domainFields } = domainData;

      // Create domain
      const domain = await RoadmapDomain.create({
        ...domainFields,
        phase: phase._id,
      });
      totalDomains++;

      for (let ti = 0; ti < topics.length; ti++) {
        const topicData = topics[ti];
        await RoadmapTopic.create({
          domain: domain._id,
          phase:  phase._id,
          title:  topicData.title,
          subtopics: topicData.subtopics ?? [],
          status: phase.status === "in-progress" ? (ti === 0 ? "in-progress" : "not-started") : "not-started",
          progress: phase.status === "in-progress" && ti === 0 ? 89 : 0,
          order: ti,
          published: true,
        });
        totalTopics++;
      }

      console.log(`   └─ Domain: ${domain.title} (${topics.length} topics)`);
    }
  }

  console.log(`\n📊 Seed complete:`);
  console.log(`   Phases:  ${PHASES.length}`);
  console.log(`   Domains: ${totalDomains}`);
  console.log(`   Topics:  ${totalTopics}`);
  console.log("\n✨ Done!\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
