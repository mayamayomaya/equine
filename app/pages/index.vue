<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="5">
        <v-card>
          <v-card-title class="text-h4 font-weight-bold pb-2">
            Equine
          </v-card-title>

          <v-card-subtitle class="text-body-1 pb-4">
            Task management, without the nonsense, and horses!.
          </v-card-subtitle>

          <v-card-actions class="flex-column align-stretch pa-4 pt-0">
            <NewWorkspaceModal />
            <UploadWorkspaceButton />
            <div class="text-center mt-3">
              <ThemeToggle />
              <div class="text-caption text-medium-emphasis">Switch Theme</div>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
