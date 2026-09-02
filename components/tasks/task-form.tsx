"use client";

import { useState, useEffect } from "react";
import { Task, Priority, TaskStatus, normalizeAssignedTo } from "@/types/task";
import { useTaskStore } from "@/store/task-store";
import { useEmployeeStore } from "@/store/employee-store";
import { format } from "date-fns";
import { X } from "lucide-react";

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

const defaultForm = {
  title: "",
  description: "",
  priority: "MEDIUM" as Priority,
  deadline: format(new Date(), "yyyy-MM-dd"),
  estimatedHours: 1,
  status: "TODO" as TaskStatus,
  assignedTo: [] as string[],
};

export function TaskForm({ task, onClose }: TaskFormProps) {
  const { addTask, updateTask } = useTaskStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const [form, setForm] = useState(() =>
    task
      ? {
          title: task.title,
          description: task.description ?? "",
          priority: task.priority,
          deadline: task.deadline,
          estimatedHours: task.estimatedHours,
          status: task.status,
          assignedTo: normalizeAssignedTo(task.assignedTo),
        }
      : defaultForm
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.deadline) errs.deadline = "Deadline is required";
    const hours = typeof form.estimatedHours === "string" ? parseFloat(form.estimatedHours) : form.estimatedHours;
    if (isNaN(hours) || hours <= 0) {
      errs.estimatedHours = "Must be > 0";
    }
    return errs;
  }

  function addEmployee(id: string) {
    if (!id) return;
    if (!form.assignedTo.includes(id)) {
      setForm((f) => ({ ...f, assignedTo: [...f.assignedTo, id] }));
    }
  }

  function removeEmployee(id: string) {
    setForm((f) => ({
      ...f,
      assignedTo: f.assignedTo.filter((empId) => empId !== id),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    const hours = typeof form.estimatedHours === "string" ? parseFloat(form.estimatedHours) : form.estimatedHours;
    const payload = {
      ...form,
      estimatedHours: hours,
      assignedTo: form.assignedTo,
    };

    if (task) {
      await updateTask(task.id, payload);
    } else {
      await addTask(payload);
    }
    setSaving(false);
    onClose();
  }

  function field(name: keyof typeof form) {
    const isHours = name === "estimatedHours";
    const rawVal = form[name];
    const displayVal = isHours && (rawVal === "" || isNaN(rawVal as number)) ? "" : rawVal;

    return {
      value: displayVal as string | number,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        let val: string | number = e.target.value;
        if (isHours) {
          val = e.target.value === "" ? "" : parseFloat(e.target.value);
        }
        setForm((f) => ({ ...f, [name]: val }));
        setErrors((er) => { const n = { ...er }; delete n[name]; return n; });
      },
    };
  }

  const unassignedEmployees = employees.filter((emp) => !form.assignedTo.includes(emp._id));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{task ? "Edit Task" : "Create New Task"}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              className={`form-input ${errors.title ? "form-input--error" : ""}`}
              placeholder="e.g. Prepare client presentation"
              {...field("title")}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Details about this task..."
              rows={3}
              {...field("description")}
            />
          </div>

          {/* Priority + Status */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority *</label>
              <select className="form-input form-select" {...field("priority")}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input form-select" {...field("status")}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Deadline + Hours */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Deadline *</label>
              <input
                type="date"
                className={`form-input ${errors.deadline ? "form-input--error" : ""}`}
                {...field("deadline")}
              />
              {errors.deadline && <span className="form-error">{errors.deadline}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Estimated Hours *</label>
              <input
                type="number"
                min="0.5"
                max="40"
                step="0.5"
                className={`form-input ${errors.estimatedHours ? "form-input--error" : ""}`}
                {...field("estimatedHours")}
              />
              {errors.estimatedHours && <span className="form-error">{errors.estimatedHours}</span>}
            </div>
          </div>

          {/* Assign To (Multi-select) */}
          <div className="form-group">
            <label className="form-label">Assigned Employees</label>

            {/* Chips for selected employees */}
            <div className="multi-assignee-chips" style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {form.assignedTo.length === 0 ? (
                <span style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}>
                  No team members assigned yet
                </span>
              ) : (
                form.assignedTo.map((empId) => {
                  const emp = employees.find((e) => e._id === empId);
                  if (!emp) return null;
                  return (
                    <span
                      key={empId}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 10px",
                        borderRadius: "9999px",
                        background: "var(--primary-subtle)",
                        color: "var(--primary)",
                        fontSize: "12px",
                        fontWeight: 600,
                        border: "1px solid var(--primary-border)"
                      }}
                    >
                      <span>{emp.name} ({emp.role})</span>
                      <button
                        type="button"
                        onClick={() => removeEmployee(empId)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "none",
                          border: "none",
                          color: "var(--primary)",
                          cursor: "pointer",
                          padding: "0"
                        }}
                        title="Remove employee"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })
              )}
            </div>

            {/* Select dropdown to add employee */}
            <select
              className="form-input form-select"
              value=""
              onChange={(e) => {
                addEmployee(e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">+ Add Team Member…</option>
              {unassignedEmployees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Saving…" : task ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

