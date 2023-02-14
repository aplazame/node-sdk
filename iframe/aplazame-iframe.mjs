

import { EventEmitter, EventDetails } from '@aplazame/helpers/event-emitter'

const copyObject = obj => JSON.parse(JSON.stringify(obj))

export class EventAplazame extends EventDetails {}

export class AplazameIFrame extends EventEmitter {
  #requestTimeout = 60000
  #allowedMessage = e => e.data?.source === 'aplazame'

  constructor ({ url = null, params = null, requestTimeout = null, allowedMessage = null } = {}) {
    super({ Event: EventAplazame })

    this.url = new URL(url)

    if (params) {
      for (const key in params) this.url.searchParams.append(key, params[key])
    }

    if (requestTimeout) this.#requestTimeout = requestTimeout
    if (allowedMessage) this.#allowedMessage = allowedMessage
  }

  #onMessage (e) {
    if (!this.#allowedMessage(e)) return

    if (e.data?.event) {
      const { event, payload = null } = e.data
      this.emit(event, payload)
    }
  }

  async request (request, _payload) {
    const payload = _payload ? copyObject(_payload) : _payload
    return new Promise(resolve => {
      this.iframe.contentWindow.postMessage({ source: 'aplazame', request, payload }, '*')
      const onResponse = () => {
        this.off(request, onResponse)
        resolve()
      }

      setTimeout(onResponse, this.#requestTimeout)
      this.on(request, onResponse)
    })
  }

  mount (el) {
    this.mount_el = el

    this.iframe = document.createElement('iframe')

    this.iframe.src = this.url.toString()

    el.appendChild(this.iframe)

    // listening messages
    const _onMessage = this.#onMessage.bind(this)

    window.addEventListener('message', _onMessage)
    this.once('unmount', () => window.removeEventListener('message', _onMessage))

    return this
  }

  unmount () {
    this.emit('unmount')

    if (this.mount_el.contains(this.iframe)) {
      this.mount_el.removeChild(this.iframe)
    }
  }
}
