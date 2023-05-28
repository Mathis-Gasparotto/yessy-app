import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth'
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore'
import { app, auth } from 'src/boot/firebase'
import createFormat from '../stores/formatting'
import { LocalStorage } from 'quasar'
import { addUser, getUser } from './userService'

const db = getFirestore(app)

export async function signup(email, password, username, birthday, referralCode, newsletter) {
  const q = query(collection(db, 'users'), where('username', '==', username.trim()))
  const querySnapshot = await getDocs(q)
  if (querySnapshot.size > 0) {
    throw new Error("Nom d'utilisateur déjà utilisé")
  }
  return setPersistence(auth, browserLocalPersistence)
    .then(() => {
      return createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const payload = {
            email: userCredential.user.email.trim(),
            birthday: createFormat().dateTimeFormatToBDD(birthday),
            newsletter,
            referralCode: referralCode ? referralCode.trim() : ''
          }
          return addUser(userCredential.user.uid, payload, username.trim())
            .then((res) => {
              LocalStorage.set('token', userCredential.user.refreshToken)
              LocalStorage.set('user', {
                ...payload,
                lastLoginAt: new Date(parseInt(userCredential.user.metadata.lastLoginAt)),
                // birthday: new Date(res.birthday.seconds * 1000),
                // createdAt: new Date(res.createdAt.seconds * 1000),
                // updatedAt: new Date(res.updatedAt.seconds * 1000),
                uid: userCredential.user.uid
              })
            })
            .catch((error) => {
              throw new Error(error.message)
            })
        })
        .catch((error) => {
          throw new Error(error.message)
        })
    })
    .catch((error) => {
      throw new Error(error.message)
    })
}
export function login(email, password) {
  return setPersistence(auth, browserLocalPersistence)
    .then(() => {
      return signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          return getUser(userCredential.user.uid)
            .then((res) => {
              LocalStorage.set('token', userCredential.user.refreshToken)
              LocalStorage.set('user', {
                ...res,
                lastLoginAt: new Date(parseInt(userCredential.user.metadata.lastLoginAt)),
                // birthday: new Date(res.birthday.seconds * 1000),
                // createdAt: new Date(res.createdAt.seconds * 1000),
                // updatedAt: new Date(res.updatedAt.seconds * 1000),
                uid: userCredential.user.uid
              })
            })
            .catch((error) => {
              throw new Error(error.message)
            })
        })
        .catch((error) => {
          throw new Error(error.message)
        })
    })
    .catch((error) => {
      throw new Error(error.message)
    })
}
export function logout() {
  const auth = getAuth(app)
  return auth
    .signOut()
    .then(() => {
      // LocalStorage.remove('token')
      LocalStorage.remove('user')
    })
    .catch((error) => {
      throw new Error(error.message)
    })
}