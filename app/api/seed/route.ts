import { getTasksCollection, getDb } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";
import { format, addDays, subDays } from "date-fns";

export async function GET() {
  try {
    const db = await getDb();
    const taskCol = await getTasksCollection();
    const userCol = db.collection("users");
    const activityCol = db.collection("activities");

    const now = new Date().toISOString();

    // 1. Seed Users
    const seedUsers = [
      {
        fullName: "Admin Manager",
        email: "admin@taskflow.com",
        passwordHash: hashPassword("adminpassword"),
        role: "ADMIN",
        createdAt: now,
        updatedAt: now,
      },
      {
        fullName: "Standard Developer",
        email: "employee@taskflow.com",
        passwordHash: hashPassword("employeepassword"),
        role: "EMPLOYEE",
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Clear and insert users
    await userCol.deleteMany({ email: { $in: seedUsers.map((u) => u.email) } });
    await userCol.insertMany(seedUsers);

    // 2. Seed Tasks
    const seedTasks = [
      {
        title: "Client Presentation Deck",
        description: "Prepare slides for the Q3 strategy review with the Deloitte leadership team.",
        priority: "HIGH",
        status: "IN_PROGRESS",
        deadline: format(new Date(), "yyyy-MM-dd"),
        estimatedHours: 3,
        assignedTo: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Weekly Status Report",
        description: "Summarize team progress and blockers for this week.",
        priority: "MEDIUM",
        status: "TODO",
        deadline: format(addDays(new Date(), 2), "yyyy-MM-dd"),
        estimatedHours: 1,
        assignedTo: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Code Review – Auth Module",
        description: "Review pull requests for the authentication service refactor.",
        priority: "HIGH",
        status: "TODO",
        deadline: format(addDays(new Date(), 1), "yyyy-MM-dd"),
        estimatedHours: 2,
        assignedTo: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Update Project Documentation",
        description: "Add API docs and deployment notes to the internal wiki.",
        priority: "LOW",
        status: "COMPLETED",
        deadline: format(subDays(new Date(), 1), "yyyy-MM-dd"),
        estimatedHours: 4,
        assignedTo: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Sprint Planning Meeting",
        description: "Prepare backlog items and team capacity for the upcoming sprint.",
        priority: "MEDIUM",
        status: "TODO",
        deadline: format(addDays(new Date(), 5), "yyyy-MM-dd"),
        estimatedHours: 1.5,
        assignedTo: [],
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Clear existing seed data
    await taskCol.deleteMany({ title: { $in: seedTasks.map((t) => t.title) } });

    const result = await taskCol.insertMany(seedTasks);
    const insertedIds = Object.values(result.insertedIds);

    // Log activities for each seeded task
    const activities = insertedIds.map((id, i) => ({
      action: "TASK_CREATED",
      description: `Task "${seedTasks[i].title}" was created`,
      taskId: id,
      taskTitle: seedTasks[i].title,
      employeeId: null,
      createdAt: now,
    }));

    await activityCol.deleteMany({ action: "TASK_CREATED", taskTitle: { $in: seedTasks.map((t) => t.title) } });
    await activityCol.insertMany(activities);

    return Response.json({
      success: true,
      usersSeeded: seedUsers.length,
      tasksSeeded: seedTasks.length,
      activitiesLogged: activities.length,
      message: "✅ Users and Tasks sample data seeded successfully into MongoDB",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
