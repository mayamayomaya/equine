<template>
  <v-container class="py-8">
    <v-row>
      <v-col cols="12" md="10" class="mx-auto">
        <v-card class="mb-4" variant="flat">
          <v-card-title>
            <h2>Equine Achievements</h2>
            <v-card-subtitle class="pa-0"> Your horse journey </v-card-subtitle>
          </v-card-title>
        </v-card>

        <v-card class="mb-4 text-center">
          <v-card-text>
            <div class="text-h6 text-medium-emphasis mb-2">Overall Rank</div>
            <div
              class="text-h1 font-weight-bold"
              :class="getRankColor(overallRank)"
            >
              {{ overallRank }}
            </div>
            <div class="text-h6 mt-2">{{ getRankTitle(overallRank) }}</div>
            <v-progress-linear
              :model-value="overallProgress"
              :color="getRankColor(overallRank).replace('text-', '')"
              height="8"
              rounded
              class="mt-4"
            />
            <div class="text-caption mt-1">
              {{ stats.totalCompleted }} tasks completed lifetime
            </div>
          </v-card-text>
        </v-card>

        <v-row>
          <v-col
            v-for="achievement in achievements"
            :key="achievement.id"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card
              :variant="achievement.unlocked ? 'elevated' : 'outlined'"
              :class="{ 'achievement-locked': !achievement.unlocked }"
            >
              <v-card-text class="text-center">
                <v-icon
                  size="48"
                  :color="achievement.unlocked ? achievement.color : 'grey'"
                  class="mb-2"
                >
                  {{ achievement.icon }}
                </v-icon>

                <div class="text-h6">{{ achievement.name }}</div>

                <div
                  class="text-h4 font-weight-bold my-2"
                  :class="getRankColor(achievement.rank)"
                >
                  {{ achievement.rank }}
                </div>

                <div class="text-body-2 text-medium-emphasis">
                  {{ achievement.description }}
                </div>

                <v-progress-linear
                  :model-value="achievement.progress"
                  :color="achievement.unlocked ? achievement.color : 'grey'"
                  height="6"
                  rounded
                  class="mt-3"
                />

                <div class="text-caption mt-1">
                  {{ achievement.current }} / {{ achievement.target }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-card class="mt-4">
          <v-card-title>Statistics</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6" sm="3">
                <div class="text-h4">{{ stats.totalTasks }}</div>
                <div class="text-caption">Total Tasks</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-h4">{{ stats.totalCompleted }}</div>
                <div class="text-caption">Completed</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-h4">{{ stats.completionRate }}%</div>
                <div class="text-caption">Completion Rate</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-h4">{{ stats.currentStreak }}</div>
                <div class="text-caption">Day Streak</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useWorkspaceStore } from "~/stores/workspace";

const store = useWorkspaceStore();
const calculateSameDayCompletions = () => {
  let sameDayCount = 0;

  store.workspaces.forEach((workspace) => {
    workspace.tasks?.forEach((task) => {
      if (task.completed && task.completedAt && task.created) {
        const createdDate = task.created.split("T")[0];
        const completedDate = task.completedAt.split("T")[0];

        if (createdDate === completedDate) {
          sameDayCount++;
        }
      }
    });
  });

  return sameDayCount;
};
const stats = ref({
  totalTasks: 0,
  totalCompleted: 0,
  totalOverdue: 0,
  workspaceCount: 0,
  completionRate: 0,
  currentStreak: 0,
  rescheduleCount: 0,
});

const ranks = [
  "G",
  "F",
  "E",
  "D",
  "C",
  "B-",
  "B",
  "B+",
  "A-",
  "A",
  "A+",
  "S-",
  "S",
  "S+",
  "SS-",
  "SS",
  "SS+",
];

const getRank = (current, thresholds) => {
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (current >= thresholds[i]) {
      return ranks[Math.min(i, ranks.length - 1)];
    }
  }
  return "G";
};

const getRankColor = (rank) => {
  if (rank.includes("SS")) return "text-purple";
  if (rank.includes("S")) return "text-deep-purple";
  if (rank.includes("A")) return "text-primary";
  if (rank.includes("B")) return "text-success";
  if (rank.includes("C")) return "text-warning";
  if (rank.includes("D")) return "text-orange";
  if (rank.includes("E")) return "text-deep-orange";
  if (rank.includes("F")) return "text-error";
  return "text-grey";
};

const getRankTitle = (rank) => {
  if (rank.includes("SS")) return "🦄 Mythical Unicorn";
  if (rank.includes("S")) return "🐴 Legendary Stallion";
  if (rank.includes("A")) return "🏇 Racing Champion";
  if (rank.includes("B")) return "🐎 Reliable Horse";
  if (rank.includes("C")) return "🐴 Average Pony";
  if (rank.includes("D")) return "🫏 Tired Mule";
  if (rank.includes("E")) return "🦙 Confused Llama";
  if (rank.includes("F")) return "🐪 Wrong Species";
  return "🦥 Not Even Trying";
};

const achievements = computed(() => {
  const taskThresholds = [
    1, 5, 10, 25, 50, 75, 100, 150, 200, 300, 400, 500, 750, 1000, 1500, 2000,
    3000,
  ];
  const workspaceThresholds = [
    1, 2, 3, 5, 7, 10, 12, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200,
  ];
  const streakThresholds = [
    1, 3, 7, 14, 21, 30, 45, 60, 75, 90, 120, 150, 180, 270, 365, 500, 730,
  ];
  const speedThresholds = [
    1, 5, 10, 20, 30, 40, 50, 65, 80, 100, 125, 150, 200, 300, 500, 750, 1000,
  ];
  const rescheduleThresholds = [
    1, 5, 10, 20, 30, 50, 75, 100, 150, 200, 300, 500, 750, 1000, 1500, 2000,
    5000,
  ];
  return [
    {
      id: "task-complete",
      name: "Task Master",
      description: "Complete tasks like a champion",
      icon: "mdi-checkbox-marked-circle",
      color: "success",
      current: stats.value.totalCompleted,
      target:
        taskThresholds[
          taskThresholds.findIndex((t) => t > stats.value.totalCompleted)
        ] || 3000,
      progress:
        (stats.value.totalCompleted /
          (taskThresholds[
            taskThresholds.findIndex((t) => t > stats.value.totalCompleted)
          ] || 3000)) *
        100,
      rank: getRank(stats.value.totalCompleted, taskThresholds),
      unlocked: stats.value.totalCompleted > 0,
    },
    {
      id: "workspace-creator",
      name: "Stable Manager",
      description: "Create and manage workspaces",
      icon: "mdi-folder-multiple",
      color: "primary",
      current: stats.value.workspaceCount,
      target:
        workspaceThresholds[
          workspaceThresholds.findIndex((t) => t > stats.value.workspaceCount)
        ] || 200,
      progress:
        (stats.value.workspaceCount /
          (workspaceThresholds[
            workspaceThresholds.findIndex((t) => t > stats.value.workspaceCount)
          ] || 200)) *
        100,
      rank: getRank(stats.value.workspaceCount, workspaceThresholds),
      unlocked: stats.value.workspaceCount > 0,
    },
    {
      id: "streak-keeper",
      name: "Consistency King",
      description: "Maintain daily completion streaks",
      icon: "mdi-fire",
      color: "orange",
      current: stats.value.currentStreak,
      target:
        streakThresholds[
          streakThresholds.findIndex((t) => t > stats.value.currentStreak)
        ] || 730,
      progress:
        (stats.value.currentStreak /
          (streakThresholds[
            streakThresholds.findIndex((t) => t > stats.value.currentStreak)
          ] || 730)) *
        100,
      rank: getRank(stats.value.currentStreak, streakThresholds),
      unlocked: stats.value.currentStreak > 0,
    },
    {
      id: "perfectionist",
      name: "Perfectionist",
      description: "Maintain high completion rate",
      icon: "mdi-star",
      color: "yellow",
      current: stats.value.completionRate,
      target: 100,
      progress: stats.value.completionRate,
      rank: getRank(
        stats.value.completionRate,
        [10, 20, 30, 40, 50, 55, 60, 65, 70, 75, 80, 85, 90, 92, 94, 96, 98]
      ),
      unlocked: stats.value.completionRate > 50,
    },
    {
      id: "procrastinator",
      name: "Master Procrastinator",
      description: "Reschedule tasks (lower is better!)",
      icon: "mdi-calendar-remove",
      color: "error",
      current: stats.value.rescheduleCount,
      target: 100,
      progress: Math.min(stats.value.rescheduleCount, 100),
      rank:
        stats.value.rescheduleCount === 0
          ? "SS+"
          : stats.value.rescheduleCount <= 5
          ? "S"
          : stats.value.rescheduleCount <= 20
          ? "A"
          : stats.value.rescheduleCount <= 50
          ? "B"
          : "G",
      unlocked: true,
    },
    {
      id: "speed-demon",
      name: "Speed Demon",
      description: "Complete tasks on the day they were created",
      icon: "mdi-lightning-bolt",
      color: "purple",
      current: calculateSameDayCompletions(),
      target:
        speedThresholds[
          speedThresholds.findIndex((t) => t > calculateSameDayCompletions())
        ] || 500,
      progress:
        (calculateSameDayCompletions() /
          (speedThresholds[
            speedThresholds.findIndex((t) => t > calculateSameDayCompletions())
          ] || 500)) *
        100,
      rank: getRank(calculateSameDayCompletions(), speedThresholds),
      unlocked: calculateSameDayCompletions() > 0,
    },
  ];
});

const overallRank = computed(() => {
  const avgProgress =
    achievements.value.reduce((acc, a) => acc + a.progress, 0) /
    achievements.value.length;
  const progressThresholds = [
    5, 10, 15, 20, 30, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
  ];
  return getRank(avgProgress, progressThresholds);
});

const overallProgress = computed(() => {
  return (
    achievements.value.reduce((acc, a) => acc + a.progress, 0) /
    achievements.value.length
  );
});

onMounted(() => {
  store.loadFromStorage();
  calculateStats();
});
const calculateStreak = () => {
  const completionDates = new Set();

  store.workspaces.forEach((workspace) => {
    workspace.tasks?.forEach((task) => {
      if (task.completed && task.completedAt) {
        const date = task.completedAt.split("T")[0];
        completionDates.add(date);
      }
    });
  });

  if (completionDates.size === 0) return 0;

  const dates = Array.from(completionDates).sort().reverse();

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split("T")[0];

    if (dates.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break; 
    }
  }

  return streak;
};

const calculateStats = () => {
  let totalTasks = 0;
  let totalCompleted = 0;
  let totalOverdue = 0;
  let totalReschedules = 0;

  store.workspaces.forEach((workspace) => {
    workspace.tasks?.forEach((task) => {
      totalTasks++;
      if (task.completed) totalCompleted++;

      if (task.rescheduleCount) {
        totalReschedules += task.rescheduleCount;
      }

      if (task.due && !task.completed) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.due);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < now) totalOverdue++;
      }
    });
  });

  stats.value = {
    totalTasks,
    totalCompleted,
    totalOverdue,
    workspaceCount: store.workspaces.length,
    completionRate:
      totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0,
    currentStreak: calculateStreak(),
    rescheduleCount: totalReschedules,
  };
};
</script>

<style scoped>
.achievement-locked {
  opacity: 0.5;
}
</style>
