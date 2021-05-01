import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter} from 'react-router-dom'
import * as serviceWorker from './serviceWorker'
import {renderRoutes} from 'react-router-config'
import routes from './routes/Routes'
import './shared/devLog'

window.onunload = () => {}

ReactDOM.render(<BrowserRouter>
    {renderRoutes(routes)}
</BrowserRouter>, document.getElementById('root'))

serviceWorker.unregister()

