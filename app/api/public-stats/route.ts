import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const userCol = db.collection("users");
    const empCol = db.collection("employees");
    const taskCol = db.collection("tasks");

    const [users, employees, taskCount] = await Promise.all([
      userCol.find({}, { projection: { fullName: 1, name: 1 } }).toArray(),
      empCol.find({}, { projection: { name: 1, fullName: 1 } }).toArray(),
      taskCol.countDocuments(),
    ]);

    const allNames: string[] = [];
    users.forEach((u) => {
      const n = (u.fullName || u.name) as string | undefined;
      if (n && !allNames.includes(n)) allNames.push(n);
    });
    employees.forEach((e) => {
      const n = (e.name || e.fullName) as string | undefined;
      if (n && !allNames.includes(n)) allNames.push(n);
    });

    const initials = allNames.slice(0, 4).map((name) => {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    });

    const totalUserCount = Math.max(allNames.length, 1);

    return Response.json({
      totalUsers: totalUserCount,
      totalTasks: taskCount,
      avatars: initials,
      label: `${totalUserCount} registered team ${totalUserCount === 1 ? "member" : "members"}`,
    });
  } catch (err) {
    console.error("[GET /api/public-stats]", err);
    return Response.json({
      totalUsers: 1,
      totalTasks: 0,
      avatars: ["TF"],
      label: "Active TaskFlow workspace",
    });
  }
}
