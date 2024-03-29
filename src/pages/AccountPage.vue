<template>
  <div class="page-container bg-2">
    <q-page class="page">
      <div v-if="!loadingUser">
        <div class="page-content">
          <div class="account__avatar-container q-mb-md position-relative">
            <div class="account__token-count-container absolute flex flex-center column text-white">
              <q-spinner-gears size="3em" color="white" v-if="loadingWallet" />
              <span v-else>
                <div class="account_token-count text-center text-bold">
                  <span>{{ userWallet }}</span>
                </div>
                <q-icon name="fa fa-coins" size="lg"></q-icon>
              </span>
            </div>
            <q-avatar size="150px">
              <q-img :src="user.avatar.imgUrl" class="account__avatar-img" />
            </q-avatar>
          </div>
          <div class="account__username-container q-mt-md">
            <q-form class="flex flex-center row form account-form" ref="updateUsernameForm" v-if="forms.username.show"
              @submit.prevent="() => {
                  handleUpdateAccount({ username: forms.username.value.trim() }).then(() => {
                    forms.username.show = false
                    forms.username.value = ''
                  })
                }
                ">
              <q-input name="username" outlined autofocus class="account-input bg-white" type="text"
                v-model="forms.username.value" lazy-rules :rules="[
                  (val) =>
                    val.length > 3 || 'Veullez renseigner minimum 4 caractères'
                ]" hide-bottom-space></q-input>
              <q-btn icon="save" type="submit" class="form-btn btn btn-primary account-submit" padding="md" />
              <q-btn icon="close" type="button" class="form-btn btn btn-secondary account-submit" padding="md" @click="() => {
                  forms.username.show = false
                  forms.username.value = ''
                }
                " />
            </q-form>
            <div class="text-h6 text-center account__username-content" v-else>
              <p class="account__username q-mr-xs text-bold">
                {{ formatting.maxStringLenght(user.username, 20) }}
              </p>
              <q-icon name="edit" color="secondary" @click="() => {
                  forms.username.show = true
                  forms.username.value = user.username
                }
                "></q-icon>
            </div>
            <p class="account__my-referal-code q-mb-0 q-mt-md text-center text-bold text-primary" @click="copy(user.myReferralCode)">#{{ user.myReferralCode }}</p>
          </div>
        </div>
        <div class="account__choices flex justify-between q-mt-sm q-mb-md">
          <q-btn
            :class="`account__choice-btn ${this.choice === 'BetsHistory' ? 'account__choice-btn--active' : ''}`"
            @click="this.choice = 'BetsHistory'" icon="fa fa-clock-rotate-left" size="1.5rem"></q-btn>
          <!-- <q-btn :class="`account__choice-btn ${this.choice === 'Shop' ? 'account__choice-btn--active' : ''}`" @click="this.choice = 'Shop'" icon="fa fa-coins" size="1.5rem"></q-btn> -->
          <q-btn :class="`account__choice-btn ${this.choice === 'AccountInfos' ? 'account__choice-btn--active' : ''}`"
            @click="this.choice = 'AccountInfos'" icon="settings" size="1.5rem"></q-btn>
        </div>
        <div class="page-content">
          <AccountInfos :userData="user" v-if="!loadingUser && this.choice === 'AccountInfos'" />
          <BetsHistory v-if="this.choice === 'BetsHistory'" />
          <div class="logout-btn-container" v-if="this.choice !== 'AccountInfos'">
            <q-btn label="Déconnexion" type="button" color="secondary" rounded @click.prevent="handleLogout()"
              :loading="logoutLoading" size="20px" padding="xs"
              class="text-bold btn btn-secondary btn-full-width btn-thin logout-btn" />
          </div>
        </div>
      </div>
    </q-page>
  </div>
</template>

<script>
import { Loading, Notify } from 'quasar'
import createFormat from '../services/formatting'
import translate from '../services/translatting'
import {
  // AuthCredential,
  getAuth,
  // reauthenticateWithCredential,
  // signInWithCustomToken,
  updateEmail,
} from 'firebase/auth'
import AccountInfos from 'src/components/Account/AccountInfos.vue'
import BetsHistory from 'src/components/Account/BetsHistory.vue'
import { LocalStorage } from 'quasar'
import { getUser, updateUserData, updateUserName } from 'src/services/userService'
import { logout } from 'src/services/authService'
import { auth } from 'src/boot/firebase'
import { getMyWallet } from 'src/services/tokenTransactionService'
import { Clipboard } from '@capacitor/clipboard'
import formatting from '../services/formatting'
// import { Plugins } from '@capacitor/core'

// const { Clipboard } = Plugins

export default {
  name: 'AccountPage',
  components: {
    AccountInfos,
    BetsHistory
  },
  data() {
    return {
      user: {},
      format: createFormat(),
      logoutLoading: false,
      forms: {
        username: {
          show: false,
          value: ''
        }
      },
      choice: 'BetsHistory',
      loadingUser: true,
      userWallet: null,
      loadingWallet: true,
      formatting: formatting()
    }
  },
  created() {
    this.reloadData()
  },
  methods: {
    copy(str) {
      Clipboard.write({
        string: str
      })
        .then(() => {
          Notify.create({
            message: 'Code de parrainage copié !',
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
            message: 'Erreur lors de la copie du code de parrainage',
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
    async reloadData() {
      // Loading.show()
      this.loadingWallet = true
      // await signInWithCustomToken(getAuth(), LocalStorage.getItem('token')).catch((err) => {
      //   Loading.hide()
      //   this.$router.push({ name: 'welcome' })
      //   LocalStorage.remove('token')
      //   LocalStorage.remove('user')
      //   Notify.create({
      //     message: 'Veuillez vous reconnecter',
      //     color: 'negative',
      //     icon: 'report_problem',
      //     position: 'top',
      //     timeout: 3000,
      //     actions: [
      //       {
      //         icon: 'close',
      //         color: 'white'
      //       }
      //     ]
      //   })
      //   throw new Error(err)
      // })
      await getUser(auth.currentUser.uid)
        .then((user) => {
          LocalStorage.set('user', user)
          this.user = user
          this.loadingUser = false
        })
        .catch((e) => {
          Notify.create({
            message: 'Une erreur est survenue',
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
          // Loading.hide()
          this.loadingWallet = false
          this.$router.push({ name: 'home' })
          throw new Error(e.message)
        })

      getMyWallet()
        .then((wallet) => {
          this.userWallet = wallet
          // Loading.hide()
          this.loadingWallet = false
        })
        .catch((e) => {
          Notify.create({
            message: 'Une erreur est survenue',
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
          // Loading.hide()
          this.loadingWallet = false
          this.$router.push({ name: 'home' })
          throw new Error(e.message)
        })
    },
    handleLogout() {
      this.logoutLoading = true
      logout()
        .then(() => {
          this.$router.push({ name: 'welcome' })
          Notify.create({
            message: 'Vous avez bien été déconnecté',
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
          this.logoutLoading = false
          Notify.create({
            message: translate().translateLogoutError(err),
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
    async handleUpdateAccount(payload) {
      Loading.show()
      if (typeof payload.email !== 'undefined') {
        await updateEmail(getAuth().currentUser, payload.email).catch((err) => {
          Loading.hide()
          Notify.create({
            message: translate().translateUpdateUserEmailError(err),
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
          throw new Error(err.message)
        })
        await updateUserData(this.user.uid, payload).catch((err) => {
          Loading.hide()
          Notify.create({
            message: translate().translateUpdateUserError(err),
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
          throw new Error(err.message)
        })
      } else if (typeof payload.username !== 'undefined') {
        await updateUserName(this.user.uid, payload.username).catch((err) => {
          Loading.hide()
          Notify.create({
            message: translate().translateUpdateUserError(err),
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
          throw new Error(err.message)
        })
      } else {
        await updateUserData(this.user.uid, payload.username).catch((err) => {
          Loading.hide()
          Notify.create({
            message: translate().translateUpdateUserError(err),
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
          throw new Error(err.message)
        })
      }
      getUser(auth.currentUser.uid)
        .then((user) => {
          LocalStorage.set('user', user)
          this.user = {
            ...user,
            avatar: this.user.avatar
          }
          Loading.hide()
          Notify.create({
            message: 'Votre compte a bien été mis à jour',
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
          Notify.create({
            message: translate().translateGetUserError(err),
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
          Loading.hide()
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.account {
  &__token-count {
    &-container {
      bottom: 0;
      left: -70px;
      padding: 10px;
      height: 90px;
      width: 90px;
      border-radius: 50%;
      background: url('/src/assets/token-bg.svg') no-repeat center center/cover;
      z-index: 1;
    }
    // ba
  }
  &__avatar {
    &-container {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      margin: auto;
      position: relative;
    }

    // &-img {
    //   border-radius: 50%;
    //   margin: auto;
    // }
  }

  &__username {
    line-height: 1;
    margin-bottom: 0;

    &-content {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__choice {
    &s {
      width: 100vw;
    }

    &-btn {
      width: 35%;
      border: none;
      border-bottom: 1px solid #ccc;
      background-color: $primary;
      color: #fff;
      padding: 20px 0;
      transition: .2s ease-in-out;

      &:nth-of-type(1) {
        border-radius: 0 10px 10px 0;
      }

      &:nth-of-type(2) {
        border-radius: 10px 0 0 10px;
      }

      &--active {
        width: 50%;
      }
    }
  }
}

.page {
  padding-top: 20px;
}

.logout-btn {
  width: 85%;
  margin: auto;

  &-container {
    position: fixed;
    bottom: 90px;
    left: 0;
    width: 100%;
    display: flex;
    z-index: 10;
  }
}
</style>
