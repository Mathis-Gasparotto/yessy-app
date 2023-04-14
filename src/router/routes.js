const routes = [
  {
    path: "/",
    component: () => import("layouts/WelcomeLayout.vue"),
    children: [
      {
        path: "",
        name: "welcome",
        component: () => import("pages/WelcomePage.vue"),
      },
      {
        path: "login",
        name: "login",
        component: () => import("pages/LoginPage.vue"),
      },
      {
        path: "signup",
        name: "signup",
        component: () => import("pages/SignupPage.vue"),
      },
    ],
  },
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/IndexPage.vue"),
      },
      {
        path: "account",
        component: () => import("pages/AccountPage.vue"),
      },
      {
        path: "bets/",
        children: [
          {
            path: "public",
            component: () => import("src/pages/Bets/PublicBetsPage.vue"),
          },
          {
            path: "create",
            component: () => import("src/pages/Bets/CreateBetPage.vue"),
          },
        ],
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
]

export default routes
