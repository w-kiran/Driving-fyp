import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { HashRouter, useRoutes } from 'react-router-dom'

import { store } from './store'
import './app/_main.scss'

import { AuthProvider } from './app/routing/AuthProvider'
import { Routes } from './app/routing/routes'

const App = () => {
  return (
    <main className="main-app">
      {useRoutes(Routes)}
      <Toaster position="bottom-right" reverseOrder={false} />
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <HashRouter>
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </HashRouter>,
)