<template>
  <v-card class="elevation-24">
    <v-toolbar dark flat>
      <v-toolbar-title style="font-weight: bold">Pointland Usage</v-toolbar-title>
    </v-toolbar>

    <!-- Shortcuts -->
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-header>
          <v-card-title style="font-weight: bold">Desktop</v-card-title>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-divider />
          <v-card-subtitle>Desktop Move Shortcuts</v-card-subtitle>
          <v-card-text> <kbd>w</kbd> - Move front </v-card-text>
          <v-card-text> <kbd>a</kbd> - Move left </v-card-text>
          <v-card-text> <kbd>s</kbd> - Move right </v-card-text>
          <v-card-text> <kbd>d</kbd> - Move back </v-card-text>
          <v-card-text> <kbd>q</kbd> - Move down </v-card-text>
          <v-card-text> <kbd>e</kbd> - Move up </v-card-text>

          <v-card-subtitle>Desktop See Shortcuts</v-card-subtitle>
          <v-card-text> <kbd>up</kbd> - See up </v-card-text>
          <v-card-text> <kbd>left</kbd> - See left </v-card-text>
          <v-card-text> <kbd>down</kbd> - See down </v-card-text>
          <v-card-text> <kbd>right</kbd> - See right </v-card-text>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-header>
          <v-card-title style="font-weight: bold">Mobile</v-card-title>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-divider />
          <v-card-subtitle>Mobile Move</v-card-subtitle>
          <v-card-text> <kbd>Left Bottom Area</kbd> - XY Plane Movement </v-card-text>
          <v-card-text> <kbd>Right Bottom Area</kbd> - Rotate Camera </v-card-text>
          <v-card-text> <kbd>Top Half Area</kbd> - XZ Plane Movement </v-card-text>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>
