import * as Sentry from '@sentry/browser'
import {getReactEnv} from '../services/env/getEnv'

const SENTRY_DNS = getReactEnv('SENTRY_DNS')
if (process.env.NODE_ENV !== 'development' && SENTRY_DNS) {
    Sentry.init({dsn: SENTRY_DNS})
}




