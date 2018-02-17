/* eslint-disable */

var EventEmitter = require('events').EventEmitter
var io = require('socket.io-client')

var SIGNALING_SERVER = "http://localhost:3000"
var USE_AUDIO = true
var USE_VIDEO = false
var DEFAULT_CHANNEL = 'default'
var MUTE_AUDIO_BY_DEFAULT = false

var ICE_SERVERS = [
  {url:'stun:stun.l.google.com:19302'}
]

export default class RTCMultiStreamClient extends EventEmitter {
  signaling_socket = null
  local_media_stream = null
  peers = {}

  constructor () {
    super()
    this.signaling_socket = io(SIGNALING_SERVER)
    this.signaling_socket.on('connect', () => {
      console.log('Connected to signaling server')
      this.setup_local_media(() => {
        this.join_chat_channel(DEFAULT_CHANNEL, {'stuff': '1337'})
      })
    })
    this.signaling_socket.on('disconnect', () => {
      console.log('Disconnected from signaling server')

      for (const peer_id in this.peers) {
        this.peers[peer_id].close()
      }

      this.peers = {}
    })
    this.signaling_socket.on('addPeer', (config) => {
      console.log('Signaling server said to add peer ', config)
      var peer_id = config.peer_id

      if (peer_id in this.peers) {
        console.log('Already connected to ', peer_id)
        return
      }

      var peer_connection = new RTCPeerConnection(ICE_SERVERS)
      this.peers[peer_id] = peer_connection
      
      peer_connection.onicecandidate = (event) => {
        if (event.candidate) {
          this.signaling_socket.emit('relayICECandidate', {
            'peer_id': peer_id,
            ice_candidate: {
              sdpMLineIndex: event.candidate.sdpMLineIndex,
              candidate: event.candidate.candidate
            }
          })
        }
      }

      peer_connection.oniceconnectionstatechange = (event) => {
        this.onIceStateChange(peer_connection, event)
      }

      peer_connection.ontrack = (e) => {
        console.log(e)
        this.emit('incoming-stream', {id: peer_id, stream: e.streams[0]})
      }

      this.local_media_stream.getTracks().forEach(track => {
          peer_connection.addTrack(track, this.local_media_stream)
      })

      if (config.should_create_offer) {
        console.log('Creating RTC offer to ', peer_id)
        peer_connection.createOffer(
          (local_description) => {
            console.log('Local offer description is: ', local_description)
            peer_connection.setLocalDescription(local_description,
            () => {
              this.signaling_socket.emit('relaySessionDescription', {peer_id, session_description: local_description})
              console.log('Offer setLocalDescription succeeded!')
            },
            () => {
              console.log('Offer setLocalDescription failed!')              
            })
          },
          (error) => {
            console.log('Error sending offer: ', error)
          }
        )
      }

    })
    this.signaling_socket.on('sessionDescription', (config) => {
      console.log('Remote description received: ', config)
      var peer_id = config.peer_id
      var peer = this.peers[peer_id]
      var remote_description = config.session_description

      var desc = new  RTCSessionDescription(remote_description)
      var stuff = peer.setRemoteDescription(desc,
        () => {
          console.log('setRemoteDescription succeeded')
          if (remote_description.type === 'offer') {
            console.log('Creating answer')
            peer.createAnswer(
              (local_description) => {
                console.log('Answer description is: ', local_description)
                peer.setLocalDescription(local_description, 
                () => {
                  this.signaling_socket.emit('relaySessionDescription', {peer_id, session_description: local_description})
                  console.log('Answer setLocalDescription succeeded')
                },
                () => {
                  console.log('Answer setlocaldesc failed')
                })
              },
              (error) => {
                console.log('Error creating answer: ', error, peer)
              }
            )
          }
        },
        (error) => {
          console.log('setRemoteDescription error: ', error)
        }
      )
      console.log('Description object: ', desc)
    })

    this.signaling_socket.on('iceCandidate', (config) => {
      var peer = this.peers[config.peer_id]
      var ice_candidate = config.ice_candidate
      peer.addIceCandidate(new RTCIceCandidate(ice_candidate))
    })

    this.signaling_socket.on('removePeer', (config) => {
      console.log('Signaling server said to remove peer: ', config)
      var peer_id = config.peer_id
      this.emit('remove-stream', peer_id)
      if (peer_id in this.peers) {
        this.peers[peer_id].close()
      }

      delete this.peers[peer_id]
    })
  }

  join_chat_channel (channel, userdata) {
    this.signaling_socket.emit('join', {'channel': channel, 'userdata': userdata})
  }

  part_chat_channel (channel) {
    this.signaling_socket.emit('part', channel)
  }

  setup_local_media (callback, errorback) {
    if (this.local_media_stream != null) {
      if (callback) {
        callback()
      }
      return
    }

    console.log('Requesting access to local audio inputs')

    navigator.getUserMedia({audio: true}, (stream) => {
      console.log('Access granted to audio')
      this.local_media_stream = stream
      if (callback) callback()
    },
      () => {
        console.log('Access denied to audio')
        if (errorback) errorback()
    })
  }

  onIceStateChange (pc, event) {
    if (pc) {
      console.log('ICE state change: ', event)
    }
  }
}
