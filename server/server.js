const express = require('express')
const app = express()
const cors = require('cors')
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(cors())
app.use(express.static(__dirname + '/static'))


var channels = {}
var sockets = {}

io.on('connection', (socket) => {
  socket.channels = {}
  sockets[socket.id] = socket

  console.log(`[${socket.id}] connection accepted`)
  socket.on('disconnect', () => {
    for (const channel in socket.channels) {
      part(channel)
    }
    console.log(`[${socket.id}] disconnected`)
    delete sockets[socket.id]
  })

  socket.on('join', (config) => {
    console.log(`[${socket.id}] join`, config)
    
    var channel = config.channel
    var userdata = config.userdata

    if (channel in socket.channels) {
      console.log(`[${socket.id}] ERROR: already joined ${channel}`)
      return
    } 

    if (!(channel in channels)) {
      channels[channel] = {}
    }

    for (id in channels[channel]) {
      channels[channel][id].emit('addPeer', {'peer_id': socket.id, 'should_create_offer': false})
      socket.emit('addPeer', {'peer_id': id, 'should_create_offer': true})
    }

    channels[channel][socket.id] = socket
    socket.channels[channel] = channel
  })

  function part (channel) {
    console.log(`[${socket.id}] left ${channel}`)
  
    if (!(channel in socket.channels)) {
      (`[${socket.id}] ERROR: not in ${channel}`)
      return
    }
  
    delete socket.channels[channel]
    delete channels[channel][socket.id]

    for (id in channels[channel]) {
      channels[channel][id].emit('removePeer', {'peer_id': socket.id})
      socket.emit('removePeer', {'peer_id': id})
    }
  }
  socket.on('part', part)

  socket.on('relayICECandidate', (config) => {
    var peer_id = config.peer_id
    var ice_candidate = config.ice_candidate
    console.log(`[${socket.id}] relaying ICE candidate to [${peer_id}]`, ice_candidate)

    if (peer_id in sockets) {
      sockets[peer_id].emit('iceCandidate', {'peer_id': socket.id, 'ice_candidate': ice_candidate})
    }
  })

  socket.on('relaySessionDescription', (config) => {
    var peer_id = config.peer_id
    var session_description = config.session_description
    console.log(`[${socket.id}] relaying session description to [${peer_id}]`, session_description)

    if (peer_id in sockets) {
      sockets[peer_id].emit('sessionDescription', {'peer_id': socket.id, 'session_description': session_description})
    }
  })
})



server.listen(process.env.PORT || 3000)
console.log('server active')