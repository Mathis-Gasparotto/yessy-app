<template>
  <div class="page-container bg-white bg-white--image">
    <q-page class="flex flex-center page column add-bet scroll">
      <div class="page-content">
        <div class="add-bet__header flex flex-center column q-py-md">
          <q-icon name="fa fa-trophy" color="white" size="30px"></q-icon>
          <h1 class="add-bet__header-title text-h6">{{ headerTitle }}</h1>
          <div class="add-bet__header-dots flex flex-center">
            <q-icon name="circle" size="17px" color="secondary"></q-icon>
            <q-icon name="circle" size="17px" :color="component === 'AddBetPrivacy' ? 'white' : 'secondary'"></q-icon>
            <q-icon name="circle" size="17px" :color="component === 'AddBetForm' ? 'secondary' : 'white'"></q-icon>
          </div>
        </div>
      </div>
      <div class="add-bet__component">
        <AddBetPrivacy v-if="component === 'AddBetPrivacy'" @choosePrivacy="(privacy) => choosePrivacy(privacy)" />
        <AddBetCategory v-if="component === 'AddBetCategory'"  @chooseCategory="(categoryId) => chooseCategory(categoryId)" />
        <AddBetForm v-if="component === 'AddBetForm'" @submitForm="(data, choices) => submitForm(data, choices)" :privacy="privacy" />
      </div>
    </q-page>
  </div>
</template>

<script>
import AddBetPrivacy from 'src/components/AddBet/AddBetPrivacy.vue'
import AddBetCategory from 'src/components/AddBet/AddBetCategory.vue'
import AddBetForm from 'src/components/AddBet/AddBetForm.vue'
import { Loading, Notify } from 'quasar'
import translate from '../../services/translatting'
import { addBet } from 'src/services/betService'

export default {
  name: 'AddBetPage',
  components: {
    AddBetPrivacy,
    AddBetCategory,
    AddBetForm
  },
  data() {
    return {
      component: 'AddBetPrivacy',
      privacy: null,
      categoryId: null
    }
  },
  computed: {
    headerTitle () {
      switch (this.component) {
        case 'AddBetPrivacy':
          return 'Choix du salon'
        case 'AddBetCategory':
          return 'Type de pari'
        case 'AddBetForm':
          return 'Paramètres du pari'
        default:
          return 'Choix du salon'
      }
    }
  },
  methods: {
    choosePrivacy(privacy) {
      this.privacy = privacy
      this.component = 'AddBetCategory'
    },
    chooseCategory(categoryId) {
      this.categoryId = categoryId
      this.component = 'AddBetForm'
    },
    submitForm(data, choices) {
      Loading.show()
      const payload = {
        ...data,
        privacy: this.privacy,
        createdAt: new Date(),
        updatedAt: new Date(),
        startAt: data.startAt ? new Date(data.startAt) : new Date(),
        endAt: new Date(data.endAt)
      }
      addBet(payload, choices, this.categoryId)
        .then((res) => {
          Loading.hide()
          this.$router.push({ name: 'single-bet', params: { id: res.id } })
        })
        .catch((err) => {
          Loading.hide()
          console.log(err)
          Notify.create({
            message: translate().translateAddBetError(err),
            color: 'negative',
            icon: 'report_problem',
            position: 'top',
            timeout: 3000,
            actions: [
              {
                icon: 'close',
                color: 'white'
              }
            ]
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.add-bet {
  &__header {
    background-color: $primary;
    color: white;
    border-radius: 10px;
    &-title {
      margin: 0;
    }
    &-dots {
      gap: 10px;
    }
  }
  &__component {
    width: 100%;
    height: 65vh;
  }
}
.page {
  justify-content: space-between;
}
</style>
