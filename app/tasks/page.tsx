"use client";

import { useState, useEffect } from "react";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { useEmployeeStore } from "@/store/employee-store";
import { Plus } from "lucide-react";

export default function TasksPage() {
  const [showForm, setShowForm] = useState(false);
  const { fetchEmployees } = useEmployeeStore();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);


  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2>All Tasks</h2>
          <p>Sorted by Smart Priority Score — highest first</p>
        </div>
        <button
          id="create-task-btn"
          className="btn btn--primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      {/* Task list */}
      <TaskList />

      {/* Create task modal */}
      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
    </>
  );
}
