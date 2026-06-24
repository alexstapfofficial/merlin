<template>
  <div class="zodiac-card-wrapper">
    <div class="zodiac-label">{{ label.toUpperCase() }}</div>
    <div class="zodiac-circle">
      <img
        :src="imagePath"
        :alt="zodiacName"
        class="zodiac-svg"
      />
    </div>
    <div class="zodiac-name">{{ zodiacName.toUpperCase() }}</div>
    <div class="zodiac-card font-mono text-xs">
      <p>Dein {{ label }} steht im Zeichen {{ zodiacName }}. Dies prägt deine Persönlichkeit und deinen Lebensweg auf einzigartige Weise.</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  zodiacSign: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  zodiacName: {
    type: String,
    required: true
  }
});

const imagePath = computed(() => {
  return `/img/zodiac/${props.zodiacSign}.svg`;
});
</script>

<style scoped>
.zodiac-card-wrapper {
  position: relative;
  padding-top: 60px;
  padding-bottom: 1rem;
}

.zodiac-label {
  position: absolute;
  top: 35px;
  left: 2rem;
  font-size: 1rem;
  letter-spacing: 2px;
  color: #1F1D20;
  font-weight: 700;
  z-index: 10;
}

.zodiac-circle {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #1F1D20;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid transparent;
  transition: transform 0.3s ease;
  overflow: hidden;
  z-index: 10;
}

.zodiac-card-wrapper:hover .zodiac-circle {
  transform: translateX(-50%) scale(1.05);
}

.zodiac-svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: brightness(2.5);
  transition: transform 0.3s ease;
}

.zodiac-card-wrapper:hover .zodiac-svg {
  transform: scale(1.1);
}

.zodiac-name {
  position: absolute;
  top: 60px;
  right: 2rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: black;
  letter-spacing: 1px;
  z-index: 10;
}

.zodiac-card {
  background-color: transparent;
  border: 1px solid;
  border-color: #1F1D20;
  transition: all 0.3s ease;
  padding: 4rem 2rem 2rem;
  min-height: 150px;
  position: relative;
  line-height: 1.6;
}

.zodiac-card-wrapper:hover .zodiac-card {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .zodiac-card-wrapper {
    padding-top: 50px;
  }

  .zodiac-circle {
    width: 90px;
    height: 90px;
  }

  .zodiac-label {
    top: 30px;
    left: 1rem;
    font-size: 0.75rem;
    letter-spacing: 1.5px;
  }

  .zodiac-name {
    top: 60px;
    right: 1rem;
    font-size: 1rem;
  }

  .zodiac-card {
    padding: 3.5rem 1.5rem 1.5rem;
    min-height: 120px;
  }
}
</style>
