import { app, auth } from 'src/boot/firebase'
import { doc, query, deleteDoc, collection, getDocs, where, addDoc, getFirestore, orderBy, updateDoc, getDoc } from 'firebase/firestore'
import { getBetByDoc } from './betService'
import { getMyWallet, addTokenTransaction, deleteTokenTransaction, updateTokenTransactionByDoc, deleteTokenTransactionByDoc } from './tokenTransactionService'
import { LocalStorage } from 'quasar'

const db = getFirestore(app)

export async function getMyParticipations() {
  const ref = query(collection(db, 'participations'), where('user', '==', doc(db, 'users', auth.currentUser.uid)), orderBy('date', 'desc'))
  const snap = await getDocs(ref)
  let list = snap.docs.map((doc) => {
    return getBetByDoc(doc.data().bet)
      .then((res) => {
        return {
          participationId: doc.id,
          ...res
        }
      })
      .catch(() => {
        return { deletedBet: true }
      })
  })
  list = await Promise.all(list)
  return list.filter((item) => {
    return !item.deletedBet && !item.disabled
  })
}
export async function getParticipationCount(betId, betCollectionName = 'simple_bets') {
  const ref = query(collection(db, 'participations'), where('bet', '==', doc(db, betCollectionName, betId)))
  const snap = await getDocs(ref)
  return snap.docs.length
  // const snap = await getCountFromServer(ref)
  // return snap.data().count
}
export async function getParticipationCountByChoiceId(choiceId, betId, betCollectionName = 'simple_bets') {
  const ref = query(collection(db, 'participations'), where('choice', '==', doc(db, `${betCollectionName}/${betId}/choices/`, choiceId)))
  const snap = await getDocs(ref)
  return snap.docs.length
  // const snap = await getCountFromServer(ref)
  // return snap.data().count
}
export async function getParticipations(betId, betCollectionName = 'simple_bets') {
  const ref = query(collection(db, 'participations'), where('bet', '==', doc(db, betCollectionName, betId)))
  const snap = await getDocs(ref)
  const list = snap.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data()
    }
  })
  return list
}
export async function getMyParticipation(betId, betCollectionName = 'simple_bets') {
  const ref = query(collection(db, 'participations'), where('bet', '==', doc(db, betCollectionName, betId)), where('user', '==', doc(db, 'users', auth.currentUser.uid)))
  const snap = await getDocs(ref)
  if (snap.docs.length === 0) {
    return null
  }
  return {
    id: snap.docs[0].id,
    ...snap.docs[0].data()
  }
}
export async function updateParticipation(participationId, betId, betCollectionName, newChoiceId = null, newTokenAmount = null) {
  let payload = {}
  if (newChoiceId && betId && betCollectionName) {
    payload = {
      ...payload,
      choice: doc(db, `${betCollectionName}/${betId}/choices`, newChoiceId)
    }
  }
  if (newTokenAmount) {
    payload = {
      ...payload,
      tokenAmount: parseInt(newTokenAmount)
    }
  }
  const betRef = doc(db, betCollectionName, betId)
  const betSnap = await getDoc(betRef)
  const bet = {
    id: betSnap.id,
    ...betSnap.data()
  }
  if (bet.disabled) {
    throw new Error('Vous ne pouvez pas modifier votre participation à un pari annulé')
  } else if (bet.endAt.seconds * 1000 < new Date().getTime()) {
    throw new Error('Vous ne pouvez pas modifier votre participation à un pari terminé')
  }
  const ref = doc(db, 'participations', participationId)
  await updateDoc(ref, payload)
  if (newTokenAmount) {
    const snap = await getDoc(ref)
    console.log(snap.data())
    return updateTokenTransactionByDoc(snap.data().transaction, {amount: parseInt(-newTokenAmount)})
  }
}
export async function getMyTokenParticipation(betId, betCollectionName = 'simple_bets') {
  const ref = query(collection(db, 'participations'), where('bet', '==', doc(db, betCollectionName, betId)), where('user', '==', doc(db, 'users', auth.currentUser.uid)))
  const snap = await getDocs(ref)
  return snap.docs[0].data().tokenAmount
}
export async function participate(betId, choiceId, tokenAmount = null, betCollectionName = 'simple_bets') {
  const ref = query(
    collection(db, 'participations'),
    where('user', '==', doc(db, 'users', auth.currentUser.uid)),
    where('bet', '==', doc(db, betCollectionName, betId))
  )
  // const count = console.log(await getCountFromServer(ref))
  const snap = await getDocs(ref)
  if (snap.docs.length > 0) {
    throw new Error('Vous participez déjà à ce pari')
  }

  // let payload = {
  //   user: doc(db, 'users', auth.currentUser.uid),
  //   bet: doc(db, betCollectionName, betId),
  //   choice: doc(db, 'bet_choices', choiceId),
  //   date: new Date()
  // }
  let payload = {
    user: doc(db, 'users', auth.currentUser.uid),
    bet: doc(db, betCollectionName, betId),
    choice: doc(db, `${betCollectionName}/${betId}/choices`, choiceId),
    date: new Date()
  }

  if (tokenAmount) {
    tokenAmount = parseInt(tokenAmount)
    const currentWallet = await getMyWallet()
    if (tokenAmount > currentWallet) {
      throw new Error("Vous n'avez pas assez de jetons")
    }

    const transaction = await addTokenTransaction(-tokenAmount, 'participation')

    payload = {
      ...payload,
      tokenAmount,
      transaction: doc(db, 'token_transactions', transaction.id)
    }

    return addDoc(collection(db, 'participations'), payload).then((participationDoc) => {
      return {
        id: participationDoc.id,
        transaction: doc(db, 'token_transactions', transaction.id),
        ...payload
      }
    }).catch((error) => {
      deleteTokenTransaction(transaction.id).then(() => {
        throw new Error(error.message)
      })
    })
  }
  return addDoc(collection(db, 'participations'), payload).then((participationDoc) => {
    return {
      id: participationDoc.id,
      ...payload
    }
  })
}
export async function iParticipate(betId, betCollectionName = 'simple_bets') {
  const ref = query(
    collection(db, 'participations'),
    where('user', '==', doc(db, 'users', auth.currentUser.uid)),
    where('bet', '==', doc(db, betCollectionName, betId))
  )
  const snap = await getDocs(ref)
  return snap.docs.length > 0
}
export async function deleteMyParticipations() {
  const ref = query(collection(db, 'participations'), where('user', '==', doc(db, 'users', auth.currentUser.uid)))
  const snap = await getDocs(ref)
  snap.docs.forEach((singleDoc) => {
    deleteDoc(doc(db, 'participations', singleDoc.id))
  })
}
export async function deleteBetParticipations(betDoc) {
  const ref = query(collection(db, 'participations'), where('bet', '==', betDoc))
  const snap = await getDocs(ref)
  snap.docs.forEach(async (singleDoc) => {
    // refund all participants
    const refund = await addTokenTransaction(singleDoc.data().tokenAmount, 'refund', singleDoc.data().user.id)

    deleteDoc(doc(db, 'participations', singleDoc.id)).catch((err) => {
      // if error, delete the refund
      deleteTokenTransaction(refund.id).then(() => {
        throw new Error(err.message)
      })
    })
  })
}
export async function deleteParticipation(betId, betCollectionName = 'simple_bets') {
  const ref = query(
    collection(db, 'participations'),
    where('user', '==', doc(db, 'users', auth.currentUser.uid)),
    where('bet', '==', doc(db, betCollectionName, betId))
  )
  const snap = await getDocs(ref)
  await deleteTokenTransactionByDoc(snap.docs[0].data().transaction)
  // await addTokenTransaction(snap.docs[0].data().tokenAmount, 'refund').then((newTokenCount) => {
  //   const user = LocalStorage.getItem('user')
  //   LocalStorage.set('user', { ...user, tokenCount: newTokenCount })
  // })
  return deleteDoc(doc(db, 'participations', snap.docs[0].id))
}
