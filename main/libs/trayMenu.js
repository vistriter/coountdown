const { Menu, shell } = require('electron')
const Sentry = require('@sentry/node')
const mixpanel = require('../libs/mixpanel')
const dialog = require('../libs/dialog')
const config = require('../../config')

module.exports = {
  getDefault: (window, loggedIn, app) => {
    const { openAtLogin } = app.getLoginItemSettings()

    let menuTemplate = []
    menuTemplate = [
      {
        label: `About ${app.getName()}`,
        click() {
          dialog.openAboutDialog()
        },
      },
      {
        label: 'Support',
        click() {
          try {
            mixpanel.track(app, 'Menu: Support')
            shell.openExternal(config.WEB_URL)
          } catch (err) {
            Sentry.captureException(err)
          }
        },
      },
      {
        type: 'separator',
      },
      {
        label: openAtLogin ? 'Disable: Launch at login' : 'Enable: Launch at login',
        click() {
          try {
            app.setLoginItemSettings({
              openAtLogin: !openAtLogin,
            })

            mixpanel.track(app, 'Menu: Open at Login', { openAtLogin: !openAtLogin })
          } catch (err) {
            Sentry.captureException(err)
          }
        },
      },
      {
        role: 'quit',
        accelerator: 'CmdOrCtrl+Q',
      },
    ]

    if (loggedIn) {
      menuTemplate.splice(3, 0, {
        label: 'Log out',
        type: 'normal',
        click() {
          try {
            window.webContents.send('logout')
          } catch (err) {
            Sentry.captureException(err)
          }
        },
      })
    }

    return Menu.buildFromTemplate(menuTemplate)
  },
}
