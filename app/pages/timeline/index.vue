<template>
  <v-container class="py-8">
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-btn icon @click="previousWeek">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>

            <v-spacer />

            <div class="text-center">
              <div class="text-h5">{{ weekRangeText }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ totalTasksText }}
              </div>
              <v-btn
                v-if="!isCurrentWeek"
                variant="text"
                size="small"
                class="mt-1"
                @click="goToToday"
              >
                Back to current week
              </v-btn>
            </div>

            <v-spacer />

            <v-btn icon @click="nextWeek">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </v-card-title>
        </v-card>

        <v-row dense>
          <v-col v-if="overdueTasks.length > 0" cols="12" md="auto">
            <v-card
              class="pa-3 h-100"
              color="error"
              variant="tonal"
              min-height="400"
              width="200"
            >
              <div class="text-subtitle-2 font-weight-bold mb-3">
                OVERDUE
                <v-chip size="x-small" class="ml-1">
                  {{ overdueTasks.length }}
                </v-chip>
              </div>

              <div class="task-container">
                <MiniTaskCard
                  v-for="task in overdueTasks"
                  :key="task.id"
                  :task="task"
                  class="mb-2"
                  @click="openTaskDetail(task)"
                  @complete="toggleComplete(task.id)"
                />
              </div>

              <v-btn
                variant="flat"
                size="small"
                class="mt-3 w-100"
                @click="rescheduleAllToToday"
              >
                Move all to today
              </v-btn>
            </v-card>
          </v-col>

          <v-col
            v-for="day in weekDays"
            :key="day.date"
            cols="12"
            :md="overdueTasks.length > 0 ? true : ''"
          >
            <v-card
              :class="{ 'today-column': day.isToday }"
              :variant="day.isToday ? 'elevated' : 'outlined'"
              :elevation="day.isToday ? 4 : 0"
              min-height="400"
              class="day-column h-100"
            >
              <v-card-title class="pb-2">
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    {{ day.dayName }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ day.dateText }}
                  </div>
                </div>
                <v-spacer />
                <v-chip
                  v-if="day.tasks.length > 0"
                  size="small"
                  variant="tonal"
                >
                  {{ day.tasks.length }}
                </v-chip>
              </v-card-title>

              <v-divider />

              <v-card-text
                class="task-drop-zone pa-2"
                :data-date="day.date"
                @dragover.prevent
                @drop="handleDrop($event, day.date)"
              >
                <div
                  v-if="day.tasks.length === 0"
                  class="empty-day text-center py-8"
                >
                  <v-icon size="48" color="grey-lighten-2">
                    {{ day.isWeekend ? "mdi-horse" : "mdi-calendar-blank" }}
                  </v-icon>
                  <div class="text-caption text-grey mt-2">
                    {{ day.isWeekend ? "Horse Weekend" : "No tasks" }}
                  </div>
                </div>

                <TransitionGroup name="task-list" tag="div" v-else>
                  <MiniTaskCard
                    v-for="task in day.tasks"
                    :key="task.id"
                    :task="task"
                    :draggable="!task.completed"
                    class="mb-2"
                    @click="openTaskDetail(task)"
                    @complete="toggleComplete(task.id)"
                    @dragstart="handleDragStart($event, task)"
                  />
                </TransitionGroup>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-dialog v-model="taskDialog" max-width="600">
      <TaskDetailDialog
        v-if="selectedTask"
        :task="selectedTask"
        @close="taskDialog = false"
        @toggle-complete="handleToggleComplete"
        @edit="handleEditTask"
        @delete="handleDeleteTask"
        @view-image="handleViewImage"
      />
    </v-dialog>
  </v-container>
</template>
<script setup>
import { useWorkspaceStore } from "~/stores/workspace";
import { storeToRefs } from "pinia";

const store = useWorkspaceStore();
const { workspaces, currentWorkspaceId } = storeToRefs(store);

const currentWeekStart = ref(getWeekStart(new Date()));
const taskDialog = ref(false);
const selectedTask = ref(null);
const draggedTask = ref(null);
const weekViewOffset = ref(0);

const weekDays = computed(() => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart.value);
    date.setDate(date.getDate() + i + weekViewOffset.value);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    const dayTasks = getTasksForDate(dateStr);

    days.push({
      date: dateStr,
      dayName: date.toLocaleDateString("en", { weekday: "short" }),
      dateText: date.toLocaleDateString("en", {
        month: "short",
        day: "numeric",
      }),
      isToday: date.getTime() === today.getTime(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      tasks: dayTasks,
    });
  }

  return days;
});

function previousWeek() {
  weekViewOffset.value -= 1;
}

function nextWeek() {
  weekViewOffset.value += 1;
}

function goToToday() {
  currentWeekStart.value = getWeekStart(new Date());
  weekViewOffset.value = 0;
}

const overdueTasks = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const tasks = [];

  workspaces.value.forEach((workspace) => {
    if (
      !currentWorkspaceId.value ||
      workspace.id === currentWorkspaceId.value
    ) {
      workspace.tasks?.forEach((task) => {
        if (task.due && task.due < todayStr && !task.completed) {
          tasks.push({
            ...task,
            workspaceId: workspace.id,
            workspaceName: workspace.name,
          });
        }
      });
    }
  });

  return tasks;
});

const weekRangeText = computed(() => {
  const start = new Date(currentWeekStart.value);
  start.setDate(start.getDate() + weekViewOffset.value);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const startMonth = start.toLocaleDateString("en", { month: "short" });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = start.getFullYear();

  if (start.getMonth() === end.getMonth()) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  } else {
    const endMonth = end.toLocaleDateString("en", { month: "short" });
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }
});

const totalTasksText = computed(() => {
  const total = weekDays.value.reduce((sum, day) => sum + day.tasks.length, 0);
  const completed = weekDays.value.reduce(
    (sum, day) => sum + day.tasks.filter((t) => t.completed).length,
    0
  );

  return `${total} tasks${completed > 0 ? ` (${completed} completed)` : ""}`;
});

const isCurrentWeek = computed(() => {
  return weekViewOffset.value === 0;
});

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getTasksForDate(dateStr) {
  const tasks = [];

  workspaces.value.forEach((workspace) => {
    if (
      !currentWorkspaceId.value ||
      workspace.id === currentWorkspaceId.value
    ) {
      workspace.tasks?.forEach((task) => {
        if (task.due) {
          const taskDueDate = task.due.includes("T")
            ? task.due.split("T")[0]
            : task.due;

          if (taskDueDate === dateStr) {
            tasks.push({
              ...task,
              workspaceId: workspace.id,
              workspaceName: workspace.name,
            });
          }
        }
      });
    }
  });

  return tasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(b.created) - new Date(a.created);
  });
}

function openTaskDetail(task) {
  selectedTask.value = task;
  taskDialog.value = true;
}

function toggleComplete(taskId) {
  workspaces.value.forEach((workspace) => {
    const task = workspace.tasks?.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
    }
  });

  store.saveToStorage();
}

function handleDragStart(event, task) {
  draggedTask.value = task;
  event.dataTransfer.effectAllowed = "move";
  event.target.style.opacity = "0.5";
}

function handleDrop(event, newDate) {
  event.preventDefault();

  if (!draggedTask.value) return;

  workspaces.value.forEach((workspace) => {
    const taskIndex = workspace.tasks?.findIndex(
      (t) => t.id === draggedTask.value.id
    );
    if (taskIndex !== -1) {
      workspace.tasks[taskIndex].due = newDate;
      store.saveToStorage();
    }
  });

  const draggedElement = document.querySelector('[style*="opacity: 0.5"]');
  if (draggedElement) {
    draggedElement.style.opacity = "";
  }

  draggedTask.value = null;
}

function rescheduleAllToToday() {
  const today = new Date().toISOString().split("T")[0];

  overdueTasks.value.forEach((task) => {
    const workspace = workspaces.value.find((w) => w.id === task.workspaceId);
    if (workspace) {
      const taskIndex = workspace.tasks.findIndex((t) => t.id === task.id);
      if (taskIndex !== -1) {
        workspace.tasks[taskIndex].due = today;
      }
    }
  });

  store.saveToStorage();
}

function handleTaskUpdate(updatedTask) {
  const workspace = workspaces.value.find(
    (w) => w.id === updatedTask.workspaceId
  );
  if (workspace) {
    const index = workspace.tasks.findIndex((t) => t.id === updatedTask.id);
    if (index !== -1) {
      workspace.tasks[index] = updatedTask;
      store.saveToStorage();
    }
  }
}

function handleTaskDelete(taskId) {
  workspaces.value.forEach((workspace) => {
    const index = workspace.tasks?.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      workspace.tasks.splice(index, 1);
      store.saveToStorage();
    }
  });
  taskDialog.value = false;
}

onMounted(() => {
  store.loadFromStorage();
});

function handleToggleComplete(taskId) {
  let found = false;
  workspaces.value.forEach((workspace) => {
    const task = workspace.tasks?.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      found = true;
    }
  });

  if (found) {
    store.saveToStorage();
    if (selectedTask.value && selectedTask.value.id === taskId) {
      selectedTask.value.completed = !selectedTask.value.completed;
      selectedTask.value.completedAt = selectedTask.value.completed
        ? new Date().toISOString()
        : null;
    }
  }
}
function handleEditTask(task) {
  navigateTo(`/task?workspace=${task.workspaceId}`);

  taskDialog.value = false;
}
function handleDeleteTask(taskId) {
  workspaces.value.forEach((workspace) => {
    const index = workspace.tasks?.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      workspace.tasks.splice(index, 1);
      store.saveToStorage();
    }
  });
  taskDialog.value = false;
}

function handleViewImage(imageUrl) {
  window.open(imageUrl, "_blank");
}
</script>
<style scoped>
.today-column {
  border: 2px solid rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.day-column {
  transition: all 0.3s ease;
}

.day-column:hover {
  transform: translateY(-2px);
}

.task-drop-zone {
  min-height: 350px;
  transition: background-color 0.2s;
}

.task-drop-zone:has(.dragging-over) {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.empty-day {
  user-select: none;
}

.task-list-move {
  transition: transform 0.3s;
}

.task-list-enter-active,
.task-list-leave-active {
  transition: all 0.3s ease;
}

.task-list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.task-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
