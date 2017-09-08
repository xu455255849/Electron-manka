import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

import Home from '../page/home/home.vue'

export default new Router({
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '*',
            redirect: '/'
        },
        {
            path: 'home',
            name: 'landing-page',
            component: require('@/components/LandingPage')
        }
    ]
})
