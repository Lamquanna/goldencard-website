// In-memory user storage (in production, use a database)
export const users = [
  {
    username: "admin",
    password: "Goldencard",
    role: "admin" as const,
    email: "sales@goldenenergy.vn",
    created_at: new Date().toISOString(),
  },
  {
    username: "sale",
    password: "Goldencard",
    role: "sale" as const,
    email: "",
    created_at: new Date().toISOString(),
  },
];
