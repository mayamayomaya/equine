import { defineStore } from "pinia";

export const useWorkspaceStore = defineStore("workspace", {
  state: () => ({
    workspaces: [],
    currentWorkspaceId: null,
    searchQuery: "", // ONE search query to rule them ALL, WHO CARES ABOUT STATE PERMANENCE, NOT ME
    stats: {
      rescheduleCount: 0,
    },
  }),

  getters: {
    currentWorkspace: (state) => {
      return (
        state.workspaces.find((w) => w.id === state.currentWorkspaceId) || null
      );
    },

    currentTasks: (state) => {
      const workspace = state.workspaces.find(
        (w) => w.id === state.currentWorkspaceId
      );
      return workspace?.tasks || [];
    },

    filteredCurrentTasks: (state) => {
      const tasks =
        state.workspaces.find((w) => w.id === state.currentWorkspaceId)
          ?.tasks || [];

      let filtered = tasks;

      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter((task) =>
          task.text.toLowerCase().includes(query)
        );
      }

      return filtered;
    },

    completedCount: (state) => {
      const workspace = state.workspaces.find(
        (w) => w.id === state.currentWorkspaceId
      );
      return workspace?.tasks.filter((t) => t.completed).length || 0;
    },

    globalSearchResults: (state) => {
      if (!state.searchQuery) return [];

      const query = state.searchQuery.toLowerCase();
      const results = [];

      state.workspaces.forEach((workspace) => {
        workspace.tasks?.forEach((task) => {
          if (task.text.toLowerCase().includes(query)) {
            results.push({
              ...task,
              workspaceName: workspace.name,
              workspaceId: workspace.id,
            });
          }
        });
      });

      return results;
    },
    overdueCount: (state) => {
      const workspace = state.workspaces.find(
        (w) => w.id === state.currentWorkspaceId
      );
      if (!workspace) return 0;

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      return workspace.tasks.filter((task) => {
        if (!task.due || task.completed) return false;
        const dueDate = new Date(task.due);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < now;
      }).length;
    },
  },

  actions: {
    loadFromStorage() {
      this.workspaces = JSON.parse(
        localStorage.getItem("equine-workspaces") || "[]"
      );
      this.stats = JSON.parse(localStorage.getItem("equine-stats") || "{}");

      this.workspaces.forEach((workspace) => {
        workspace.tasks?.forEach((task) => {
          if (task.completed === undefined) {
            task.completed = false;
            task.completedAt = null;
          }
        });
      });

      this.currentWorkspaceId =
        localStorage.getItem("current-workspace") || null;

      this.saveToStorage();
    },

    saveToStorage() {
      localStorage.setItem(
        "equine-workspaces",
        JSON.stringify(this.workspaces)
      );
      localStorage.setItem("equine-stats", JSON.stringify(this.stats || {}));
      if (this.currentWorkspaceId) {
        localStorage.setItem("current-workspace", this.currentWorkspaceId);
      }
    },
    setCurrentWorkspace(workspaceId) {
      this.currentWorkspaceId = workspaceId;
      this.saveToStorage();
    },

    addWorkspace(workspace) {
      this.workspaces.push(workspace);
      this.currentWorkspaceId = workspace.id;
      this.saveToStorage();
    },

    deleteWorkspace(workspaceId) {
      this.workspaces = this.workspaces.filter((w) => w.id !== workspaceId);
      if (this.currentWorkspaceId === workspaceId) {
        this.currentWorkspaceId = this.workspaces[0]?.id || null;
      }
      this.saveToStorage();
    },

    renameWorkspace(workspaceId, newName) {
      const workspace = this.workspaces.find((w) => w.id === workspaceId);
      if (workspace) {
        workspace.name = newName;
        this.saveToStorage();
      }
    },
    updateTaskInWorkspace(workspaceId, taskId, updates) {
      const workspace = this.workspaces.find((w) => w.id === workspaceId);
      if (workspace) {
        const taskIndex = workspace.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex !== -1) {
          workspace.tasks[taskIndex] = {
            ...workspace.tasks[taskIndex],
            ...updates,
          };
          this.saveToStorage();
        }
      }
    },
    updateCurrentTasks(tasks) {
      const workspace = this.workspaces.find(
        (w) => w.id === this.currentWorkspaceId
      );
      if (workspace) {
        workspace.tasks = tasks;
        this.saveToStorage();
      }
    },
    setSearchQuery(query) {
      this.searchQuery = query;
    },

    clearSearch() {
      this.searchQuery = "";
    },
    toggleTaskComplete(taskId) {
      const workspace = this.workspaces.find(
        (w) => w.id === this.currentWorkspaceId
      );
      if (workspace) {
        const task = workspace.tasks.find((t) => t.id === taskId);
        if (task) {
          task.completed = !task.completed;
          task.completedAt = task.completed ? new Date().toISOString() : null;
          this.saveToStorage();
        }
      }
    },

    clearCompleted() {
      const workspace = this.workspaces.find(
        (w) => w.id === this.currentWorkspaceId
      );
      if (workspace) {
        workspace.tasks = workspace.tasks.filter((t) => !t.completed);
        this.saveToStorage();
      }
    },
    rescheduleOverdueTasks() {
      const workspace = this.workspaces.find(
        (w) => w.id === this.currentWorkspaceId
      );
      if (!workspace) return;

      const today = new Date().toISOString().split("T")[0];
      let rescheduledCount = 0;

      workspace.tasks.forEach((task) => {
        if (task.due && !task.completed) {
          const dueDate = new Date(task.due);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          dueDate.setHours(0, 0, 0, 0);

          if (dueDate < now) {
            task.due = today;
            task.rescheduledAt = new Date().toISOString();
            task.rescheduleCount = (task.rescheduleCount || 0) + 1;
            rescheduledCount++;
          }
        }
      });

      if (rescheduledCount > 0) {
        this.stats.rescheduleCount =
          (this.stats.rescheduleCount || 0) + rescheduledCount;
        this.saveToStorage();
      }

      return rescheduledCount;
    },

    getOverdueCount() {
      const workspace = this.workspaces.find(
        (w) => w.id === this.currentWorkspaceId
      );
      if (!workspace) return 0;

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      return workspace.tasks.filter((task) => {
        if (!task.due || task.completed) return false;
        const dueDate = new Date(task.due);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < now;
      }).length;
    },
    moveTaskToWorkspace(taskId, fromWorkspaceId, toWorkspaceId) {
      const sourceWorkspace = this.workspaces.find(
        (w) => w.id === fromWorkspaceId
      );
      const targetWorkspace = this.workspaces.find(
        (w) => w.id === toWorkspaceId
      );

      if (!sourceWorkspace || !targetWorkspace) return false;

      const taskIndex = sourceWorkspace.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return false;

      const [task] = sourceWorkspace.tasks.splice(taskIndex, 1);

      targetWorkspace.tasks.push(task);

      this.saveToStorage();

      return true;
    },
  },
});
