<template>
  <div class="page-container bg-2 bg-2--image single-bet">
    <q-page class="page">
      <div class="single-bet__top-container">
        <q-icon class="single-bet__top-icon" name="fa fa-trophy" size="xl" color="white"></q-icon>
      </div>
      <div class="page-content" v-if="bet">
        <q-avatar size="50px" class="single-bet__author-avatar q-mb-md">
          <q-img :src="bet.author.avatar.imgUrl || defaultAvatarUrl"></q-img>
        </q-avatar>
        <div class="single-bet__title-container">
          <q-icon
            :class="`single-bet__privacy single-bet__privacy--${bet.privacy}`"
            :name="`lock${bet.privacy === 'public' ? '_open' : ''}`"
            color="white"
          ></q-icon>
          <div class="single-bet__title-text">
            <h1 class="single-bet__title text-h6">{{ formatting.maxStringLenght(bet.label, 100) }}</h1>
          </div>
        </div>
        <p class="single-bet__subtitle">
          <span class="single-bet__created-by">créé par&nbsp;</span>
          <span :class="`single-bet__author ${bet.author.username === 'Utilisateur supprimé' ? 'text-italic' : ''}`">{{
            bet.author.username
          }}</span>
        </p>
        <q-list class="single-bet__props">
          <q-item class="single-bet__prop">
            <span class="single-bet__prop-icon-container flex flex-center">
              <img
                class="single-bet__prop-icon"
                :src="`${bet.category.iconUrl.replace('.svg', '')}-secondary.svg`"
                width="32"
                height="32"
              />
            </span>
            <p class="single-bet__prop-text q-mb-0 flex flex-center">{{ bet.category.label }}</p>
          </q-item>
          <q-item class="single-bet__prop">
            <span class="single-bet__prop-icon-container">
              <q-icon class="single-bet__prop-icon" name="info_outline" size="md" color="secondary" />
            </span>
            <p class="single-bet__prop-text q-mb-0">{{ bet.description }}</p>
          </q-item>
          <q-item class="single-bet__prop" v-if="bet.customCost">
            <span class="single-bet__prop-icon-container flex flex-center">
              <q-icon class="single-bet__prop-icon" name="fa fa-hand-holding-dollar" size="md" color="secondary" />
            </span>
            <p class="single-bet__prop-text q-mb-0 flex flex-center">{{ bet.customCost }}</p>
          </q-item>
          <q-item class="single-bet__prop">
            <span class="single-bet__prop-icon-container flex flex-center">
              <q-icon class="single-bet__prop-icon" name="fa fa-gift" size="md" color="secondary" />
            </span>
            <p class="single-bet__prop-text q-mb-0 flex flex-center">
              {{ bet.customReward ? bet.customReward : 'Des smiles 😊' }}
            </p>
          </q-item>
          <q-item class="single-bet__prop" v-if="bet.startAt">
            <span class="single-bet__prop-icon-container flex flex-center">
              <q-icon class="single-bet__prop-icon" name="calendar_month" size="md" color="secondary" />
            </span>
            <p class="single-bet__prop-text q-mb-0 flex flex-center">
              {{
                (new Date(bet.startAt.seconds * 1000) > new Date() ? 'Débute le ' : 'A débuté le ') +
                formatting.dateTimeToDisplay(bet.startAt.seconds * 1000)
              }}
            </p>
          </q-item>
          <q-item class="single-bet__prop">
            <span class="single-bet__prop-icon-container flex flex-center">
              <q-icon class="single-bet__prop-icon" name="sports_score" size="md" color="secondary" />
            </span>
            <p class="single-bet__prop-text q-mb-0 flex flex-center">
              {{
                (new Date(bet.endAt.seconds * 1000) > new Date() ? 'Se termine le ' : 'Est terminé depuis le ') +
                formatting.dateTimeToDisplay(bet.endAt.seconds * 1000)
              }}
            </p>
          </q-item>
        </q-list>
        <q-toggle
          v-if="isAuthor && bet.endAt.seconds * 1000 > Date.now()"
          v-model="bet.privacy"
          :label="`Pari ${bet.privacy === 'private' ? 'privé' : 'public'}`"
          true-value="private"
          false-value="public"
          color="primary"
          unchecked-icon="lock_open"
          checked-icon="lock"
          class="q-my-md single-bet__privacy-toggle"
          size="60px"
          dense
          :disable="updatePrivacyLoading"
          @update:model-value="handleUpdateBetPrivacy(bet.privacy)"
        />
        <div class="single-bet__participants flex items-center justify-evenly q-my-md">
          <span class="single-bet__participants-text">
            <span class="single-bet__participants-count">{{ bet.participants }}</span>
            participant{{ bet.participants > 1 ? 's' : '' }}
          </span>
          <span class="single-bet__participants-avatars" v-if="bet.participants > 0">
            <q-img
              v-if="bet.participants > 0"
              src="~assets/example-avatar-1.png"
              class="single-bet__participant-avatar"
              style="z-index: 3"
            ></q-img>
            <q-img
              v-if="bet.participants > 1"
              src="~assets/example-avatar-2.png"
              class="single-bet__participant-avatar"
              style="z-index: 2"
            ></q-img>
            <q-img
              v-if="bet.participants > 2"
              src="~assets/example-avatar-3.png"
              class="single-bet__participant-avatar"
              style="z-index: 1"
            ></q-img>
            <div class="single-bet__participants-surplus-count" v-if="bet.participants > 3">
              +{{ bet.participants - 3 }}
            </div>
          </span>
        </div>
        <div v-if="iParticipate && !bet.customCost && !bet.customReward" class="q-mb-md">
          <p class="text-center q-mb-0">Vous avez parié {{ myTokenParticipation }} Smiles 😊</p>
          <p class="text-center q-mb-0">Sur "{{ myChoice.label }}"</p>
        </div>
        <div v-if="iParticipate && bet.customCost && bet.customReward" class="q-mb-md">
          <p class="text-center q-mb-0">Vous avez parié sur "{{ myChoice.label }}"</p>
        </div>
        <p v-if="bet.winnerChoice" class="text-center q-mb-md">
          La bonne réponse était : "{{ bet.winnerChoice.label }}"
        </p>
        <q-btn
          v-if="bet.startAt.seconds * 1000 < Date.now() && bet.endAt.seconds * 1000 >= Date.now() && !isAuthor"
          :label="iParticipate === false ? 'Rejoindre le pari' : 'Modifier ma participation'"
          type="button"
          color="secondary"
          rounded
          :to="`/bets/join/${route.params.id}`"
          padding="xs"
          class="q-mb-md btn btn-secondary single-bet__leave-btn"
        />
        <q-btn
          v-if="iParticipate === true && bet.endAt.seconds * 1000 >= Date.now()"
          label="Quitter le pari"
          type="button"
          color="secondary"
          rounded
          @click.prevent="leaveBet()"
          :loading="leaveLoading"
          padding="xs"
          class="q-mb-md btn btn-secondary single-bet__join-btn"
        />
        <q-btn
          label="Définir le choix gagnant"
          type="button"
          text-color="white"
          color="secondary"
          rounded
          :to="`/bets/define-winner-choice/${route.params.id}`"
          padding="xs"
          class="q-mb-md btn btn-secondary single-bet__delete-btn"
          v-if="isAuthor && bet.endAt.seconds * 1000 <= Date.now() && !bet.winnerChoice"
        />

        <p
          v-if="(isAuthor || bet.privacy === 'public') && bet.endAt.seconds * 1000 > Date.now()"
          class="text-center q-mb-md"
        >
          Code d'accès :&nbsp;<span class="text-bold" @click="copy(bet.id)">{{ bet.id }}</span>
        </p>
        <q-btn
          label="Partager le pari"
          type="button"
          text-color="secondary"
          color="white"
          rounded
          @click.prevent="share(bet.id)"
          padding="xs"
          class="q-mb-md btn btn-secondary btn-bordered--thin single-bet__delete-btn"
          icon="share"
          v-if="(isAuthor || bet.privacy === 'public') && bet.endAt.seconds * 1000 > Date.now()"
        />
        <q-btn
          label="Annuler le pari"
          type="button"
          text-color="secondary"
          color="white"
          rounded
          @click.prevent="handleDeleteBet()"
          :loading="deleteLoading"
          padding="xs"
          class="q-mb-md btn btn-secondary btn-bordered--thin single-bet__delete-btn"
          v-if="isAuthor && bet.endAt.seconds * 1000 > Date.now()"
        />
      </div>
    </q-page>
  </div>
</template>

<script>
import { Dialog, Loading, Notify } from 'quasar'
import { useRoute } from 'vue-router'
import translate from '../../services/translatting'
import { auth } from 'src/boot/firebase'
import {
  deleteParticipation,
  getMyTokenParticipation,
  getParticipationCount,
  iParticipate
} from 'src/services/participationService'
import { deleteBet, getBet, updateBetPrivacy } from 'src/services/betService'
import { getMyChoiceByBetId } from 'src/services/choiceService'
import formatting from 'src/services/formatting'
import { Share } from '@capacitor/share'
import { Clipboard } from '@capacitor/clipboard'
// import { Plugins } from '@capacitor/core'

// const { Share } = Plugins
// const { Clipboard } = Plugins

export default {
  setup() {
    const route = useRoute()

    return {
      route,
      formatting: formatting()
    }
  },
  name: 'SingleBetPage',
  data() {
    return {
      bet: null,
      deleteLoading: false,
      iParticipate: null,
      defaultAvatarUrl: process.env.DEFAULT_AVATAR_URL,
      myTokenParticipation: null,
      myChoice: null,
      updatePrivacyLoading: false,
      leaveLoading: false
    }
  },
  created() {
    Loading.show()
    this.reloadData()
  },
  computed: {
    isAuthor() {
      return this.bet && this.bet.author.uid === auth.currentUser.uid
    }
  },
  methods: {
    handleUpdateBetPrivacy(newPrivacy) {
      this.updatePrivacyLoading = true
      updateBetPrivacy(this.route.params.id, newPrivacy)
        .then(() => {
          this.updatePrivacyLoading = false
          Notify.create({
            message: `Le pari est maintenant ${newPrivacy === 'private' ? 'privé' : 'public'}`,
            color: 'positive',
            icon: 'check_circle',
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
        .catch((e) => {
          this.bet.privacy = newPrivacy === 'private' ? 'public' : 'private'
          this.updatePrivacyLoading = false
          Notify.create({
            message: translate().translateUpdateBetPrivacyError(e),
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
    },
    copy(code) {
      Clipboard.write({
        string: code
      })
        .then(() => {
          Notify.create({
            message: 'Code copié !',
            color: 'positive',
            icon: 'check_circle',
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
        .catch(() => {
          Notify.create({
            message: 'Erreur lors de la copie du code',
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
    },
    share(code) {
      Share.share({
        title: "Partage d'un pari sur Yessy",
        text: `Rejoins mon pari sur Yessy ! Le code d'accès est : ${code}
        Sinon, tu peux y accéder directement via ce lien :`,
        url: `https://yessy.app/#/bets/${code}`,
        dialogTitle: 'Partage de pari'
      })
    },
    async reloadData() {
      this.iParticipate = await iParticipate(this.route.params.id)
      if (this.iParticipate) {
        this.myTokenParticipation = await getMyTokenParticipation(this.route.params.id)
        this.myChoice = await getMyChoiceByBetId(this.route.params.id)
      }
      getBet(this.route.params.id)
        .then((res) => {
          this.bet = res
          getParticipationCount(this.route.params.id).then((res) => {
            this.bet.participants = res
          })
          Loading.hide()
        })
        .catch(() => {
          Loading.hide()
          Notify.create({
            message: "Le pari n'existe pas, ou a été supprimé",
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
          this.$router.push({ name: 'public-bets' })
        })
    },
    handleDeleteBet() {
      Dialog.create({
        title: 'Annuler le pari',
        message: 'Êtes-vous sûr de vouloir annuler ce pari ?',
        // persistent: true,
        ok: {
          label: 'Annuler',
          color: 'negative',
          unelevated: true
        },
        cancel: {
          label: 'Retour',
          color: 'primary',
          unelevated: true
        }
      })
        .onOk( () => {
          this.deleteLoading = true
          deleteBet(this.route.params.id)
            .then(() => {
              this.deleteLoading = false
              this.$router.push({ name: 'public-bets' })
              Notify.create({
                message: 'Le pari a bien été supprimé',
                color: 'positive',
                icon: 'check_circle',
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
            .catch((err) => {
              this.deleteLoading = false
              console.log(err)
              Notify.create({
                message: translate().translateDeleteBetError(err),
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
        })
        .onCancel(() => {
          // this.deleteLoading = false
        })
    },
    leaveBet() {
      this.leaveLoading = true
      deleteParticipation(this.route.params.id)
        .then(() => {
          this.leaveLoading = false
          Notify.create({
            message: 'Vous avez quitté le pari',
            color: 'positive',
            icon: 'check_circle',
            position: 'top',
            timeout: 3000,
            actions: [
              {
                icon: 'close',
                color: 'white'
              }
            ]
          })
          this.reloadData()
        })
        .catch((err) => {
          this.leaveLoading = false
          Notify.create({
            message: translate().translateDeleteParticipationError(err),
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
// img {
//   width: 50px;
//   height: 50px;
// }

.page {
  &-content {
    align-items: center;
    display: flex;
    flex-direction: column;
  }
}

.single-bet {
  &__top {
    &-container {
      width: 100%;
      height: 120px;
      background: url('/src/assets/single-bet-top.png') no-repeat top center/contain;
      text-align: center;
    }

    &-icon {
      margin: auto;
      margin-top: 30px;
    }
  }

  &__author {
    font-weight: 700;

    &-avatar {
      // width: 50px;
      // height: 50px;
      // border-radius: 50%;
      margin-top: -45px;
    }
  }

  &__title {
    &-container {
      display: flex;
      max-width: 90%;
      gap: 10px;
    }

    margin: 0;
    line-height: 1em;
    font-weight: 700;
    color: $primary;

    &-text {
      margin: auto 0;
    }
  }

  &__subtitle {
    margin: auto;
    margin: 5px 0 20px;
  }

  &__created-by {
    color: $primary;
  }

  &__privacy {
    width: 30px;
    height: 30px;
    font-size: 20px;
    border: 2px solid white;
    border-radius: 5px;

    &--public {
      background-color: $secondary;
    }

    &--private {
      background-color: $primary;
    }
  }

  &__prop {
    &-icon {
      &-container {
        margin-right: 10px;
      }
    }

    padding: 12px 16px;

    &s {
      width: 100%;
    }
  }

  &__participant {
    &s {
      &-text {
        text-align: center;
        font-size: 1.2em;
        font-weight: 200;
        padding: 5px 0;
      }

      color: white;
      background-color: $primary;
      padding: 8px;
      width: 100%;
      border-radius: 10px;

      &-count {
        font-weight: 300;
        font-size: 1.7rem;
      }

      &-avatars {
        display: flex;
        justify-content: center;
      }

      &-surplus-count {
        font-weight: 400;
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: $secondary;
        border-radius: 50%;
      }
    }

    &-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: -7px;
    }
  }

  &__join-btn,
  &__leave-btn,
  &__delete-btn {
    width: 100%;
    font-size: 1.2rem;
  }
}
</style>

<style lang="scss">
.single-bet {
  &__privacy-toggle[aria-checked='false'] {
    .q-toggle__track {
      background-color: $secondary;
    }
    .q-toggle__thumb {
      i.q-icon {
        color: #fff;
        opacity: 1;
      }
      &::after {
        background-color: $secondary;
      }
    }
  }
}
</style>
