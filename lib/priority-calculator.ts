import { differenceInDays, startOfDay, parseISO } from "date-fns";
import { Task } from "@/types/task";

export function calculateSmartScore(task: Task): number {
  let score = 0;

  // Priority score
  if (task.priority === "HIGH") score += 40;
  else if (task.priority === "MEDIUM") score += 25;
  else score += 10;

  // Deadline urgency score
  const today = startOfDay(new Date());
  const deadline = startOfDay(parseISO(task.deadline));
  const daysUntilDeadline = differenceInDays(deadline, today);

  if (daysUntilDeadline <= 0) score += 40; // today or overdue
  else if (daysUntilDeadline <= 2) score += 30;
  else if (daysUntilDeadline <= 7) score += 15;

  // Quick completion bonus
  if (task.estimatedHours <= 2) score += 10;

  return score;
}

export function getRecommendedTask(tasks: Task[]): Task | null {
  const activeTasks = tasks.filter((t) => t.status !== "COMPLETED");
  if (activeTasks.length === 0) return null;

  return activeTasks.reduce((best, current) => {
    const bestScore = calculateSmartScore(best);
    const currentScore = calculateSmartScore(current);
    return currentScore > bestScore ? current : best;
  });
}

export function isOverdue(task: Task): boolean {
  if (task.status === "COMPLETED") return false;
  const today = startOfDay(new Date());
  const deadline = startOfDay(parseISO(task.deadline));
  return differenceInDays(deadline, today) < 0;
}

export function getDeadlineLabel(deadline: string): string {
  const today = startOfDay(new Date());
  const dl = startOfDay(parseISO(deadline));
  const diff = differenceInDays(dl, today);

  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  return `${diff}d left`;
}
