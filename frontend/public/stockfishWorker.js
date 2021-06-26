/* eslint-disable no-restricted-globals */
if (!WebAssembly.instantiateStreaming) {
  WebAssembly.instantiateStreaming = async (res, importObject) => {
    const source = await (await res).arrayBuffer()
    return await WebAssembly.instantiate(source, importObject)
  }
}

let wasmResolve
let wasmReady = new Promise(resolve => {
  wasmResolve = resolve
})

self.addEventListener(
  'message',
  () => {
    const { eventType, eventData, eventId } = event.data

    if (eventType === 'INITIALISE') {
      WebAssembly.instantiateStreaming(fetch(eventData), {}).then(instantiatedModule => {
        const wasmExports = instantiatedModule.instance.exports

        // Resolve our exports for when the messages
        // to execute functions come through
        wasmResolve(wasmExports)

        // Send back initialised message to main thread
        self.postMessage({
          eventType: 'INITIALISED',
          eventData: Object.keys(wasmExports)
        })
      })
    } else if (eventType === 'CALL') {
      wasmReady
        .then(wasmInstance => {
          const method = wasmInstance[eventData.method]
          const result = method.apply(null, eventData.arguments)
          self.postMessage({
            eventType: 'RESULT',
            eventData: result,
            eventId: eventId
          })
        })
        .catch(error => {
          self.postMessage({
            eventType: 'ERROR',
            eventData: 'An error occured executing WASM instance function: ' + error.toString(),
            eventId: eventId
          })
        })
    }
  },
  false
)
