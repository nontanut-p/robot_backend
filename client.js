'use strict';

const Peer = require('simple-peer');
const wrtc = require('wrtc');
const exec = require('child_process').exec;
var io = null, clients = null;
//var ros2node = require('./ros2node');
var socket = null;
var d = new Date();
const now = d.toLocaleTimeString()
const status = require('./computerStatus')
const cam2node = require('./node2node');
//var gnss2node = require('./gnss2node')
let pc = {
  cpuUsage: 0,
  ramUsage: 0,
  battery: 0,
  temp: 0,

}
let database64 = {
  img: 0
}
const gnssDataArr = [] 
let gnssData = {
  lat : 0,
  lon : 0,
  alt : 0,
  dir : 0,
  velo : 0,
  x: 0,
  y : 0,
  dis : 0
}
const callrosnode = ()=>{
  cam2node.base64(database64)
 
}
const gnssrosnode = ()=>{
  gnssData = cam2node.parseData()
  if(gnssDataArr.length < 100){
    gnssDataArr.push(gnssData)
  }else{
    gnssDataArr.shift();
    gnssDataArr.push(gnssData)
  }
  console.log(gnssDataArr)

 
}
setInterval(()=>{status.status(pc)}, 10000)
setInterval(callrosnode,500)
setInterval(gnssrosnode,500)


var pcConfig = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
    },
  ]
};

module.exports = {
  init: init,
  remove_client: remove_client,
  get_client_from_socket_id: get_client_from_socket_id,
  set_turn_server: (turn)=>{
    pcConfig.iceServers.push( turn );
  },
  add_client: (socket_id, auth_type)=>{
    var client = new cClient(socket_id, auth_type);
    clients.push(client);
    return client;
  }
};


class cClient{
  constructor( _socket_id, _auth_type){
    this.socket_id = _socket_id;
    this.user_id = null;
    this.auth_type = _auth_type;
    this.b_connected = false;
  }

  destroy(){
    if( this.peer ){
      this.peer.destroy();
      this.peer = null;
    }
    remove_client(this);
  }

  sendMessage(message){
    var msg = { to: this.socket_id, message: message };
    socket.emit('message', msg);
  }

  send_peer(data){
    try{
      if( data.event )
        this.peer.send(JSON.stringify(data));
      else
        this.peer.send(data);
    }
    catch(err){
      console.log(err);
      this.destroy();
    }
  }

  createPeerConnection(cnt=0){
    console.log('createPeerConnection');
    var th = this;
    console.log('this',th)
    if( cnt > 20 ){
      return Promise.reject('createPeerConnection : wait too long');
    }
    return new Promise((resolve,reject)=>{
      var peer = this.peer = new Peer({
        initiator: true,
        config: pcConfig,
        wrtc: wrtc
      });
      peer.on('error', (err)=>{
        console.error(err);
      });

      peer.on('connect', () => {
        console.log('peer connected');
        th.b_connected = true;
      });
      peer.on('close', () => {
        console.log('peer closed');
        th.b_connected = false;
        th.destroy();
      });
      peer.on('signal', (data)=>{
        th.sendMessage(data);
        resolve();
      });
      // got data from user
      peer.on('data', (data) => {
        //console.log('got data : '+JSON.stringify(data));
        try{
          data = JSON.parse(data);
         // console.log('data event =  ',data.event)
        }
        catch(e){
          console.warn('cannot parse data');
          return;
        }
        console.log('data : '+JSON.stringify(data));
        if( data.event=='ready' ){
          th.send_peer({event:'ready'});
        }
         else if( data.event=='get_path_list' ){
    /*      ros2node.get_path_list()
          .then((res)=>{
            console.log(res);
            th.send_peer({event:'get_path_list', paths: res.name});
          })
          .catch((e)=>{
            console.error('get_path_list', e);
            th.send_peer({event:'get_path_list', err: e});
          }); */

          console.log('get_path_list 555')
          th.send_peer({event: 'get_path_list', paths:'something'})
        }
        else if(data.event == 'stream'){
          //console.log('send stream data already',)
          th.send_peer({event : 'stream', base64:database64.img } )
        }
        
        else if(data.event='get_pc_status'){
          th.send_peer({event: 'get_pc_status', status:pc})
        }

        else if(data.event=='get_path' ){
          console.log('get_path')
          var d = new Date();
          var now = d.toLocaleTimeString()
          console.log(now)
          /* ros2node.get_path(data.name)
          .then((waypoints)=>{
            th.send_peer({event:'get_path', waypoints: waypoints});
          })
          .catch((e)=>{
            console.error('get_path', e);
            th.send_peer({event:'get_path', err: e});
          });
        */}
        else{
          // send data back to user
          console.log('else')
          th.send_peer({event:'recv'});
        }
      });
    });
  }
 
  set_signal(msg){
    this.peer.signal(msg);
  }

  is_same(client){
    return this.socket_id==client.socket_id;
  }
};


function init(_clients, _socket){
  clients = _clients;
  socket = _socket;
  return console.log('init 5555');
  //ros2node.init();
}


function remove_client(client){
  console.log('remove client');
  for(var i=0;i<clients.length;i++){
    if( client.is_same(clients[i]) ){
      clients.splice( i, 1 );
      break;
    }
  }
}

function create_random_string(len){
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

function create_user_socket_id(user_id){
  for(var k=0;k<100;k++){
    var id = ''+user_id + '_' + create_random_string( 9 ), b_ok = true;
    for(var i=0;i<clients.length;i++){
      if( id==clients[i].socket_id ){
        b_ok = false;
        break;
      }
    }
    if( b_ok )
      return id;
  }
  throw new Error('create_user_socket_id() : cannot create id');
}

function get_client_from_socket_id(socket_id){
  for(var i=0;i<clients.length;i++){
    if( clients[i].socket_id == socket_id )
    return clients[i];
    }

  return null;

}
