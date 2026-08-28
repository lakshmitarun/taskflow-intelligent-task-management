"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "@/store/task-store";
import { useEmployeeStore } from "@/store/employee-store";
import { Task, TaskStatus, Priority } from "@/types/task";
import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";
import { SlidersHorizontal, ClipboardList, Search, RefreshCw } from "lucide-react";

export function TaskList() {
  const { tasks, fetchTasks, loading, error } = useTaskStore();
  const { employees } = useEmployeeStore();
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "ALL">("ALL");
  const [filterPriority, setFilterPriority] = useState<Priority | "ALL">("ALL");
  const [filterEmployee, setFilterEmployee] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filtered = tasks
    .filter((t) => filterStatus === "ALL" || t.status === filterStatus)
    .filter((t) => filterPriority === "ALL" || t.priority === filterPriority)
    .filter((t) => filterEmployee === "ALL" || t.assignedTo === filterEmployee)
    .filter((t) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (b.smartScore ?? 0) - (a.smartScore ?? 0));

  return (
    <>
      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-bar__icon">
          <SlidersHorizontal size={16} />
        </div>

        {/* Search */}
        <div className="search-wrapper">
          <Search size={14} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search tasks"
          />
        </div>

        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "ALL")}
          aria-label="Filter by status"
        >
          <option value="ALL">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          className="filter-select"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as Priority | "ALL")}
          aria-label="Filter by priority"
        >
          <option value="ALL">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          className="filter-select"
          value={filterEmployee}
          onChange={(e) => setFilterEmployee(e.target.value)}
          aria-label="Filter by employee"
        >
          <option value="ALL">All Members</option>
          <option value="">Unassigned</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.name}
            </option>
          ))}
        </select>

        <button
          className="btn btn--ghost"
          onClick={fetchTasks}
          disabled={loading}
          style={{ marginLeft: "auto" }}
          aria-label="Refresh tasks"
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} />
        </button>

        <span className="filter-count">
          {filtered.length} task{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && (
        <div className="error-banner">{error}</div>
      )}

      {/* Task grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} className="empty-state__icon" />
          <h3 className="empty-state__title">No tasks found</h3>
          <p className="empty-state__desc">
            {tasks.length === 0
              ? "Create your first task to get started."
              : "Try adjusting the filters above."}
          </p>
        </div>
      ) : (
        <div className="task-grid">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={setEditTask} />
          ))}
        </div>
      )}

      {editTask && (
        <TaskForm task={editTask} onClose={() => setEditTask(null)} />
      )}
    </>
  );
}
