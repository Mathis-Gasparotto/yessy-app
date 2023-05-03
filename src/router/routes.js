const routes = [
  {
    path: '/',
    component: () => import('layouts/WelcomeLayout.vue'),
    children: [
      {
        path: '',
        name: 'welcome',
        component: () => import('pages/WelcomePage.vue')
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/LoginPage.vue')
      },
      {
        path: 'signup',
        name: 'signup',
        component: () => import('pages/SignupPage.vue')
      }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('src/pages/HomePage.vue')
      },
      {
        path: 'account',
        name: 'account',
        component: () => import('pages/AccountPage.vue')
      },
      {
        path: 'bets/',
        children: [
          {
            path: 'public',
            name: 'public-bets',
            component: () => import('src/pages/Bets/PublicBetsPage.vue')
          },
          {
            path: 'add',
            name: 'add-bets',
            children: [
              {
                path: '',
                name: 'add-bet-privacy',
                component: () => import('src/pages/Bets/AddBet/PrivacyPage.vue')
              },
            ]
          },
          {
            path: ':id',
            name: 'single-bet',
            component: () => import('src/pages/Bets/SingleBetPage.vue')
          }
        ]
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
