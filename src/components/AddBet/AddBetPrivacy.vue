<template>
  <div class="add-bet-privacy__choices flex flex-center column">
    <div class="add-bet-privacy__choice-public flex flex-center column clickable" @click="$emit('choosePrivacy', 'public')">
      <h2 class="add-bet-privacy__choice-text text-h4 text-bold">Pari Public</h2>
      <q-icon class="add-bet-privacy__choice-icon" name="public" color="white" size="100px"></q-icon>
    </div>
    <div class="add-bet-privacy__choice-private flex flex-center column clickable" @click="$emit('choosePrivacy', 'private')">
      <h2 class="add-bet-privacy__choice-text text-h4 text-bold">Pari Privé</h2>
      <q-icon class="add-bet-privacy__choice-icon" name="lock" color="white" size="100px"></q-icon>
    </div>
    <div class="nav-bar-bg bg-primary"></div>
  </div>
</template>

<script>
export default {
  name: 'AddBetPrivacy',
}
</script>

<style lang="scss" scoped>
.add-bet {
  &-privacy {
    &__choice {
      &s {
        width: 100%;
        height: 100%;
      }
      &-text {
        margin: 0;
        color: white;
        margin: 0;
      }
      &-public, &-private {
        height: 50%;
        width: 100%;
      }
      &-public {
        background-color: $secondary;
        border-radius: 15px 15px 0 0;
      }
      &-private {
        background-color: $primary;
      }
    }
  }
}
</style>
