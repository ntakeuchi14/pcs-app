import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/index.js'

import SignIn from '@/pages/signin/SignInPage.vue';
import Dashboard from '@/pages/dashboard/DashboardPage.vue';
import SignRoot from '@/pages/document/SignRoot.vue';
import AllSigns from '@/pages/document/AllSignsPage.vue'
import Sign from '@/pages/document/SignPage.vue'
import SignCompletion from '@/pages/document/SignCompletionPage.vue'
import InformationRoot from '@/pages/information/InformationRoot.vue'
import AllInformations from '@/pages/information/AllInformationsPage.vue'
import Information from '@/pages/information/InformationPage.vue'

import AdminCompanyRoot from '@/pages/company/AdminCompanyRoot.vue'
import AdminAllCompanies from '@/pages/company/AdminAllCompaniesPage.vue'
import AdminCompany from '@/pages/company/AdminCompanyPage.vue'
import AdminCompanyUser from '@/pages/company/AdminCompanyUserPage.vue'

import AdminUserRoot from '@/pages/user/AdminUserRoot.vue'
import AdminAllUsers from '@/pages/user/AdminAllUsersPage.vue'
import AdminUserCreation from '@/pages/user/AdminUserCreation.vue'
import Inquiry from '@/pages/footer/Inquiry.vue'
import Environment from '@/pages/footer/Environment.vue'
import Auth from "@aws-amplify/auth"
import { onAuthUIStateChange } from '@aws-amplify/ui-components'

import AllAnswers from '@/pages/answer/AllAnswersPage.vue'
import AnswerRoot from '@/pages/answer/AnswerRoot.vue'
import Answer from '@/pages/answer/AnswerPage.vue'
import AnswerCompletion from '@/pages/answer/AnswerCompletionPage.vue'

Vue.use(VueRouter)

let user

getUser().then((user) => {
  if (!user) {
    router.push({ path: '/login' }, () => {})
  }
})

function getUser() {
  return Auth.currentAuthenticatedUser().then((data) => {
    if (data && data.signInUserSession) {
      if (store.state && store.state.user && data.username !== store.state.user.username) {
        Auth.signOut();
        store.commit('setUser', null)
        return null
      }
      store.commit('setUser', data)
      return data;
    }
  }).catch(() => {
    store.commit('setUser', null)
    return null
  })
}
onAuthUIStateChange(async (state) => {
  if (state === 'signedout') {
    user = null
    store.commit('setUser', null)
    router.push({ path: '/login' }, () => {})
  }
  else if (state === 'signedin') {
    user = await getUser();
    router.push({ path: '/dashboard' }, () => {})
  }
})

const routes = [{
    path: '/',
    redirect: '/dashboard',
    meta: { requireAuth: true }
  },
  {
    path: '/dummy',
    name: 'dummy'
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      requireAuth: true,
      title: "ダッシュボード"
    }
  },
  {
    path: '/login',
    name: 'login',
    component: SignIn,
    meta: {
      title: "ログイン"
    }
  },
  {
    path: '/sign',
    component: SignRoot,
    meta: { requireAuth: true },
    children: [{
        path: '/',
        redirect: 'all',
        meta: {
          requireAuth: true,
        }
      },
      {
        path: 'all',
        name: 'signs',
        component: AllSigns,
        meta: {
          requireAuth: true,
          title: "同意書一覧"
        }
      },
      {
        path: 'complete',
        name: 'signComplete',
        component: SignCompletion,
        meta: {
          requireAuth: true,
          title: "同意書記名完了"
        },
        props: true
      },
      {
        path: ':impl_no',
        name: 'sign',
        component: Sign,
        meta: {
          requireAuth: true,
          title: "記名照会"
        },
        props: true
      },
      {
        path: ':impl_no/:company_code',
        name: 'adminSign',
        component: Sign,
        meta: {
          requireAuth: true,
          adminOnly: true,
          title: "記名照会"
        },
        props: true
      },
    ]
  },
  {
    path: '/information',
    component: InformationRoot,
    meta: { requireAuth: true },
    children: [{
        path: '/',
        redirect: 'all',
        meta: {
          requireAuth: true
        },
      },
      {
        path: 'all',
        name: 'informations',
        component: AllInformations,
        meta: {
          requireAuth: true,
          title: "連絡事項一覧"
        },
        props: true
      },
      {
        path: 'new',
        name: 'newInformation',
        component: Information,
        meta: {
          requireAuth: true,
          adminOnly: true,
          title: "新規連絡事項登録"
        }
      },
      {
        path: ':information_id',
        name: 'information',
        component: Information,
        meta: {
          requireAuth: true,
          title: "連絡事項"
        }
      },
    ]
  },
  {
    path: '/answer',
    component: AnswerRoot,
    meta: { requireAuth: true },
    children: [{
        path: '/',
        redirect: 'all',
        meta: {
          requireAuth: true
        },
      },
      {
        path: 'all',
        name: 'allAnswers',
        component: AllAnswers,
        meta: {
          requireAuth: true,
          title: "アンケート一覧"
        },
        props: true
      },
      {
        path: ':impl_no/:history_no',
        name: 'answer',
        component: Answer,
        meta: {
          requireAuth: true,
          title: "アンケート"
        },
        props: true
      },
      {
        path: ':impl_no/:company_code/:history_no',
        name: 'answerAdmin',
        component: Answer,
        meta: {
          requireAuth: true,
          adminOnly: true,
          title: "アンケート"
        },
        props: true
      },
      {
        path: 'complete',
        name: 'answerComplete',
        component: AnswerCompletion,
        meta: {
          requireAuth: true,
          title: "アンケート記入完了"
        },
        props: true
      },
    ]
  },
  {
    path: '/admin/company',
    component: AdminCompanyRoot,
    meta: { requireAuth: true },
    children: [{
        path: '/',
        redirect: 'all',
        meta: {
          requireAuth: true,
        },
      },
      {
        path: 'all',
        name: 'adminCompanies',
        component: AdminAllCompanies,
        meta: {
          requireAuth: true,
          title: "会社一覧"
        },
        props: true
      },
      {
        path: 'create',
        name: 'adminCreateCompany',
        component: AdminCompany,
        meta: {
          requireAuth: true,
          title: "新規会社登録"
        }
      },
      {
        path: ':company_id',
        name: 'adminEditCompany',
        component: AdminCompany,
        meta: {
          requireAuth: true,
          title: "会社編集"
        },
        props: true
      },
      {
        path: 'user_maintenance/:company_id',
        name: 'adminEditCompanyUser',
        component: AdminCompanyUser,
        meta: {
          requireAuth: true,
          title: "会社ユーザ編集"
        },
        props: true
      },
    ]
  },
  {
    path: '/user',
    component: AdminUserRoot,
    meta: { requireAuth: true },
    children: [{
        path: '/',
        redirect: 'all',
        meta: {
          requireAuth: true
        },
      },
      {
        path: 'all',
        name: 'adminUsers',
        component: AdminAllUsers,
        meta: {
          requireAuth: true,
          title: "ユーザー一覧"
        },
        props: true
      },
      {
        path: 'create',
        name: 'adminCreateUser',
        component: AdminUserCreation,
        meta: {
          requireAuth: true,
          title: "新規ユーザー登録"
        },
        props: true
      },
      {
        path: 'edit',
        name: 'adminEditUser',
        component: AdminUserCreation,
        meta: {
          requireAuth: true,
          title: "ユーザー編集"
        },
        props: true
      }
    ]
  },
  {
    path: '/inquiry',
    name: 'inquiry',
    component: Inquiry,
    meta: {
      requireAuth: true,
      title: "お問い合わせ"
    }
  },
  {
    path: '/environment',
    name: 'environment',
    component: Environment,
    meta: {
      requireAuth: true,
      title: "推奨環境"
    }
  },
  {
    path: '*',
    redirect: '/dashboard',
    meta: { requireAuth: true }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach(async(to, from, next) => {
  router['referrer'] = from;
  if (to.matched.some(record => record.meta.adminOnly)) {
    user = await getUser()
    const isAdmin = !!user.signInUserSession.accessToken.payload["cognito:groups"]
    if (!isAdmin) {
      throw Error("404")
    } else {
      return next()
    }
  }
  return next()
})

router.beforeResolve(async(to, from, next) => {
  if (to.matched.some(record => record.meta.requireAuth)) {
    user = await getUser()
    if (!user) {
      return next({
        path: '/login'
      })
    }
    return next()
  }
  return next()
})


router.afterEach((to) => {
  try {
    const title = router.app.$t(`menu.${to.name}`)
    document.title = `${title}|${router.app.$t('pageTitle')}` || router.app.$t('pageTitle')
  } catch(e){
    console.debug(e)
  }
 })
 

export default router