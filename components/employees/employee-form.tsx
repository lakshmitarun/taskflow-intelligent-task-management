"use client";

import { useState } from "react";
import { Employee } from "@/types/employee";
import { useEmployeeStore } from "@/store/employee-store";
import { X } from "lucide-react";

interface EmployeeFormProps {
  employee?: Employee;
  onClose: () => void;
}

export function EmployeeForm({ employee, onClose }: EmployeeFormProps) {
  const { addEmployee, updateEmployee } = useEmployeeStore();
  const [form, setForm] = useState(() => ({
    name: employee?.name ?? "",
    email: employee?.email ?? "",
    role: employee?.role ?? "",
    department: employee?.department ?? "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Invalid email address";
    if (!form.role.trim()) errs.role = "Role is required";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    if (employee) {
      await updateEmployee(employee._id, form);
    } else {
      await addEmployee(form);
    }
    setSaving(false);
    onClose();
  }

  function field(name: keyof typeof form) {
    return {
      value: form[name],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((f) => ({ ...f, [name]: e.target.value }));
        setErrors((er) => { const n = { ...er }; delete n[name]; return n; });
      },
    };
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">
            {employee ? "Edit Employee" : "Add Team Member"}
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              className={`form-input ${errors.name ? "form-input--error" : ""}`}
              placeholder="e.g. Sarah Johnson"
              {...field("name")}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className={`form-input ${errors.email ? "form-input--error" : ""}`}
              placeholder="sarah@company.com"
              {...field("email")}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role *</label>
              <input
                className={`form-input ${errors.role ? "form-input--error" : ""}`}
                placeholder="e.g. Frontend Developer"
                {...field("role")}
              />
              {errors.role && <span className="form-error">{errors.role}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                className="form-input"
                placeholder="e.g. Engineering"
                {...field("department")}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Saving…" : employee ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
