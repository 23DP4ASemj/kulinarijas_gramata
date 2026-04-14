<template>
  <v-card
    class="achievement-card pa-5"
    variant="flat"
    :class="{
      'achievement-card--locked': !achievement.is_unlocked,
      'achievement-card--recent': recentlyUnlocked,
    }"
    :style="cardStyle"
  >
    <div class="achievement-card__glow" />

    <div class="d-flex align-start justify-space-between ga-3 mb-4 position-relative">
      <div class="d-flex align-start ga-3">
        <div class="achievement-card__icon">
          <v-icon :icon="achievement.icon" size="24" />
        </div>
        <div>
          <div class="achievement-card__title">{{ achievement.title }}</div>
          <div class="achievement-card__description">{{ achievement.description }}</div>
        </div>
      </div>

      <div class="d-flex flex-column align-end ga-2">
        <v-chip size="small" class="achievement-card__tier-chip" :style="tierChipStyle">
          <v-icon start :icon="achievement.current_tier.icon" size="16" />
          {{ achievement.current_tier.label }}
        </v-chip>
        <v-chip size="small" variant="outlined" class="achievement-card__status-chip">
          {{ achievement.is_unlocked ? 'Atbloķēts' : 'Bloķēts' }}
        </v-chip>
        <v-chip v-if="recentlyUnlocked" size="small" color="success" variant="flat">
          Tikko iegūts
        </v-chip>
      </div>
    </div>

    <div class="achievement-card__progress-block">
      <div class="d-flex align-center justify-space-between ga-3 mb-2">
        <div class="text-body-2 text-medium-emphasis">Progress</div>
        <div class="achievement-card__progress-value">{{ achievement.progress_label }}</div>
      </div>

      <v-progress-linear
        :model-value="achievement.progress_percentage"
        height="12"
        rounded
        bg-color="rgba(148, 163, 184, 0.18)"
        :color="progressColor"
      />
    </div>

    <div class="achievement-card__next-target mt-4">
      <template v-if="achievement.next_target">
        <span class="text-medium-emphasis">Nākamais mērķis</span>
        <strong>
          {{ achievement.next_target.tier.label }} · {{ achievement.next_target.value_label }}
        </strong>
        <span class="text-medium-emphasis">
          Vēl {{ achievement.next_target.remaining_label }}
        </span>
      </template>
      <template v-else>
        <span class="text-medium-emphasis">Maksimālais līmenis</span>
        <strong>Zelta līmenis sasniegts</strong>
      </template>
    </div>

    <div class="achievement-card__tiers mt-4">
      <div
        v-for="tier in achievement.tiers"
        :key="tier.key"
        class="achievement-card__tier-pill"
        :class="{ 'achievement-card__tier-pill--reached': tier.is_reached }"
        :style="{ '--tier-color': tier.color }"
      >
        <v-icon :icon="tier.icon" size="15" />
        <span>{{ tier.label }}</span>
        <strong>{{ tier.threshold_label }}</strong>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  achievement: {
    type: Object,
    required: true,
  },
  recentlyUnlocked: {
    type: Boolean,
    default: false,
  },
})

const accentColor = computed(() => props.achievement?.current_tier?.color || '#A0A7B4')
const progressColor = computed(() => props.achievement?.current_tier?.key === 'locked' ? '#7C8899' : accentColor.value)
const cardStyle = computed(() => ({
  '--achievement-accent': accentColor.value,
}))
const tierChipStyle = computed(() => ({
  '--achievement-chip-bg': `${accentColor.value}20`,
  '--achievement-chip-border': `${accentColor.value}40`,
  '--achievement-chip-color': accentColor.value,
}))
</script>

<style scoped>
.achievement-card {
  position: relative;
  overflow: hidden;
  height: 100%;
  border: 1px solid rgba(15, 23, 42, 0.07);
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.75), transparent 35%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.98));
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);
  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
}

.achievement-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 22px 46px rgba(15, 23, 42, 0.1);
}

.achievement-card--locked {
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.5), transparent 35%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(241, 245, 249, 0.98));
}

.achievement-card--recent {
  border-color: color-mix(in srgb, var(--achievement-accent) 48%, white);
  box-shadow: 0 24px 50px color-mix(in srgb, var(--achievement-accent) 18%, transparent);
}

.achievement-card__glow {
  position: absolute;
  top: -64px;
  right: -64px;
  width: 160px;
  height: 160px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--achievement-accent) 22%, transparent);
  filter: blur(18px);
  pointer-events: none;
}

.achievement-card__icon {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 18px;
  color: var(--achievement-accent);
  background: color-mix(in srgb, var(--achievement-accent) 14%, white);
  border: 1px solid color-mix(in srgb, var(--achievement-accent) 24%, white);
}

.achievement-card__title {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.28;
  color: rgb(var(--v-theme-on-surface));
}

.achievement-card__description {
  margin-top: 6px;
  max-width: 36ch;
  font-size: 0.93rem;
  line-height: 1.5;
  color: rgba(15, 23, 42, 0.66);
}

.achievement-card__tier-chip {
  border: 1px solid var(--achievement-chip-border);
  color: var(--achievement-chip-color);
  background: var(--achievement-chip-bg);
  font-weight: 700;
}

.achievement-card__status-chip {
  background: rgba(255, 255, 255, 0.58);
}

.achievement-card__progress-block {
  position: relative;
  z-index: 1;
}

.achievement-card__progress-value {
  font-size: 0.92rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.achievement-card__next-target {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  font-size: 0.92rem;
  line-height: 1.45;
}

.achievement-card__tiers {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.achievement-card__tier-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.68);
  color: rgba(15, 23, 42, 0.72);
  font-size: 0.82rem;
}

.achievement-card__tier-pill strong {
  margin-left: auto;
  font-size: 0.82rem;
  font-weight: 700;
}

.achievement-card__tier-pill--reached {
  border-color: color-mix(in srgb, var(--tier-color) 40%, white);
  color: color-mix(in srgb, var(--tier-color) 84%, black);
  background: color-mix(in srgb, var(--tier-color) 16%, white);
}

@media (max-width: 760px) {
  .achievement-card__tiers {
    grid-template-columns: 1fr;
  }
}

:deep(.v-theme--dark) .achievement-card {
  border-color: rgba(255, 255, 255, 0.08);
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.08), transparent 32%),
    linear-gradient(180deg, rgba(18, 24, 33, 0.96), rgba(11, 18, 28, 0.98));
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.28);
}

:deep(.v-theme--dark) .achievement-card__description,
:deep(.v-theme--dark) .achievement-card__tier-pill {
  color: rgba(226, 232, 240, 0.72);
}

:deep(.v-theme--dark) .achievement-card__tier-pill {
  background: rgba(15, 23, 42, 0.55);
  border-color: rgba(148, 163, 184, 0.2);
}

:deep(.v-theme--dark) .achievement-card__status-chip {
  background: rgba(15, 23, 42, 0.48);
}
</style>
