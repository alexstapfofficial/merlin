<template>
    <form>
      <select v-model="locale">
        <option value="en">Englisch</option>
        <option value="de">Deutsch</option>
        <option value="fr">Französisch</option>
      </select>
    </form>
</template>

<script setup>
const { locale } = useI18n();
</script>