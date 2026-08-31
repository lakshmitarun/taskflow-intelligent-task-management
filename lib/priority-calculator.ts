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

  if (isOverdue(task) || daysUntilDeadline <= 0) score += 40; // today or overdue
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

  // 1. Calendar deadline check
  const today = startOfDay(new Date());
  const deadline = startOfDay(parseISO(task.deadline));
  if (differenceInDays(deadline, today) < 0) return true;

  // 2. Estimated hours expiration from creation time
  if (task.createdAt && typeof task.estimatedHours === "number" && task.estimatedHours > 0) {
    const createdTime = new Date(task.createdAt).getTime();
    if (!isNaN(createdTime)) {
      const expirationTime = createdTime + task.estimatedHours * 60 * 60 * 1000;
      if (Date.now() > expirationTime) {
        return true;
      }
    }
  }

  return false;
}

export function getDeadlineLabel(taskOrDeadline: Task | string): string {
  if (typeof taskOrDeadline === "object" && taskOrDeadline !== null) {
    const task = taskOrDeadline;
    if (isOverdue(task)) {
      const today = startOfDay(new Date());
      const dl = startOfDay(parseISO(task.deadline));
      const diff = differenceInDays(dl, today);
      if (diff < 0) return `${Math.abs(diff)}d overdue`;
      return "Expired";
    }
    return getDeadlineLabel(task.deadline);
  }

  const deadline = taskOrDeadline;
  const today = startOfDay(new Date());
  const dl = startOfDay(parseISO(deadline));
  const diff = differenceInDays(dl, today);

  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  return `${diff}d left`;
}

