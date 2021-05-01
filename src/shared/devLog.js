import {isDevelopmentMode} from './isDevelopmentMode'

if (!isDevelopmentMode())
    console.log = () => {
    }
