<script setup></script>

<template>
  <div class="slotContainer">
    <slot name="title"><h2>Default placeholder</h2></slot>
    <slot name="content"><p>Lorem Ipsum</p></slot>
    <slot name="caption"><p>dolor sit amet</p></slot>
  </div>
</template>

<style scoped>
.slotContainer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 8px;
  background-color: honeydew;
  padding: 3px;
}
</style>
