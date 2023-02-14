
const isArray = Array.isArray

const promiseResolved = Promise.resolve()
const nextTick = fn => promiseResolved.then(fn)

function _removeItemFromList (list, item) {
  if (!list) return
  for (var i = list.length - 1; i >= 0; i--) {
    if (item === list[i]) list.splice(i, 1)
  }
}

export class EventDetails extends Event {
  details = null
  
  constructor (eventName, { details = null } = {}) {
    super(eventName)

    this.details = details
  }
}

export class EventEmitter {
  #listeners = {}
  #listenersOnce = {}
  #listenersAny = []

  #Event = EventDetails

  constructor ({ Event = null } = {}) {
    if (Event) this.#Event = Event
  }

  emit (event, details) {
    if (isArray(event)) {
      event.forEach(_event => this.emit(_event, details))
      return this
    }

    this.#listenersAny.forEach(listener => nextTick(listener.bind(null, new this.#Event(event, { details }))))
    this.#listeners[event]?.forEach(listener => nextTick(listener.bind(null, new this.#Event(event, { details }))))
    this.#listenersOnce[event]?.splice(0).forEach(listener => nextTick(listener.bind(null, new this.#Event(event, { details }))))
  }

  on (event, listener) {
    if (isArray(event)) {
      event.forEach(_event => this.on(_event, listener))
      return this
    }
    if (!this.#listeners[event]) this.#listeners[event] = []
    this.#listeners[event].push(listener)
    return this
  }

  once (event, listener) {
    if (isArray(event)) {
      event.forEach(_event => this.once(_event, listener))
      return this
    }
    if (!this.#listenersOnce[event]) this.#listenersOnce[event] = []
    this.#listenersOnce[event].push(listener)
    return this
  }

  off (event, listener) {
    if (isArray(event)) {
      event.forEach(_event => this.off(_event, listener))
      return this
    }
    _removeItemFromList(this.#listeners[event], listener)
    _removeItemFromList(this.#listenersOnce[event], listener)
    return this
  }

  onAny (listener) {
    this.#listenersAny.push(listener)
    return this
  }

  offAny (listener) {
    _removeItemFromList(this.#listenersAny, listener)
    return this
  }
}
