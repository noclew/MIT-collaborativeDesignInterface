//..................initialize required modules
var express = require('express');
var app=express();
var http=require('http');


app.use(express.static(__dirname + '/public'));


var server = app.listen(process.env.PORT || 8080, function() {
  console.log('Listening on port %d', server.address().port);
});


// //................................................................
// ███╗   ███╗ ██████╗ ███╗   ██╗ ██████╗  ██████╗    ██████╗ ██████╗ 
// ████╗ ████║██╔═══██╗████╗  ██║██╔════╝ ██╔═══██╗   ██╔══██╗██╔══██╗
// ██╔████╔██║██║   ██║██╔██╗ ██║██║  ███╗██║   ██║   ██║  ██║██████╔╝
// ██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║██║   ██║   ██║  ██║██╔══██╗
// ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║╚██████╔╝╚██████╔╝██╗██████╔╝██████╔╝
// ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ╚═╝╚═════╝ ╚═════╝                                                                   
//...................................................................
//.............serverSide MongoDB....................................

var mongo = require('mongodb'),
MongoServer = mongo.Server,
Db = mongo.Db,
ObjectID = mongo.ObjectID;

//.................open a connection to the mongodb server
var mdbserver = new MongoServer('localhost', 27017, {auto_reconnect: true});
//.................ask the server for the database named "DBASE" this databse will be created if it doesn't exist already
var db = new Db('DBASE', mdbserver,{safe:true});

//.................get or create a collection in cubeDB to store objects
//global variable that will be set to the object collection as soon as it is created or returned from the database

var userCollection=null;
//.................open the database
db.open(function(err, db) {
  if(!err) {
    //if all went well [that is mongoDB is alive and listening]
    console.log("We are connected to mongoDB");
    //create a collection named theCollection and if it succeeds set the global variable theCollection to 
    //point to the newly created or opened collection

    db.createCollection(
      'userCollection',         //name of collection to open
      {safe:false},           //unsafe mode, if the collection already exists just give us the existing one
      function(err, collection) {   //this function is called as soon as the databse has either found or created a collection with the requested name
        userCollection=collection;  //set the global variable theCollection to the newly found collection
      });
  }
});

//.............End of mongo DB..........................................



//...............................................................
// ███████╗ ██████╗  ██████╗██╗  ██╗███████╗████████╗██╗ ██████╗ 
// ██╔════╝██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝██║██╔═══██╗
// ███████╗██║   ██║██║     █████╔╝ █████╗     ██║   ██║██║   ██║
// ╚════██║██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   ██║██║   ██║
// ███████║╚██████╔╝╚██████╗██║  ██╗███████╗   ██║██╗██║╚██████╔╝
// ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝╚═╝╚═╝ ╚═════╝                                                        
//.............................http://patorjk.com/software/taag/#p=display&f=Calvin%20S&t=SOCKET.IO


var io = require('socket.io').listen(server);

var users={};
var id=1;

io.sockets.on('connection', function (socket) {
  console.log("CONNECTION");

  // socket.user={'id':"user"+id, 'socket':socket};
  // id++;

  // users[socket.user.id]=socket.user;
  
  // var allusers=[];
  // for(var i in users) {
  //   allusers.push({id:users[i].id, pos:users[i].pos});
  // }

  socket.emit('welcome', {});
  console.log("user connected:");
  //socket.broadcast.emit('userJoined', {'id':socket.user.id, 'pos':socket.user.pos});


  // login function
  socket.on('login', function(data){
    console.log('login has been requested by a user')

    userCollection.findOne({name:data.name}, function(_err, _doc) {
      if (_doc) { //name found
        console.log("findOne:"+data.name); 
        if (_doc.password==data.password) {

          userCollection.update( {_id: ObjectID(_doc._id) }, {"$set": {color: data.color}});

          var userpacket={name:_doc.name, _id:_doc._id, color:data.color};
          socket.emit("loggedin", userpacket);        
          socket.broadcast.emit("userJoined", userpacket);
          socket.user=_doc;
        }
        else {
          console.log("password mismatch:");
          socket.emit("loginFailed", {error:"password mismatch"});
        }
      }
      else //name doesn't exist 
      {
        userCollection.insert(data, {w:1}, function(_err, _docs) {
          if (_docs && _docs.length) {
            var u=_docs[0];
            console.log("inserted:" + _docs[0].name);
            var userpacket={name:u.name, _id:u._id, color:u.color};
            socket.user=u;
            socket.emit("loggedin", userpacket);        
            socket.broadcast.emit("userJoined", userpacket);
          }
          else {
            socket.emit("loginFailed", {error:"can't add user"});
            console.log("can't add user")
          }

        });            
      }
      
    });
});

socket.on('disconnect', function(){
  if (!socket.user) return;
  io.sockets.emit('userLeft', {'id':socket.user.id});
  delete users[socket.user.id];
});

  //......................................................
  socket.on('moved', function(data){
    socket.user.pos=data.pos; //remember the last position of each user
    io.sockets.emit('moved', data);
  });

  socket.on('clicked', function(data){
    io.sockets.emit('clicked', data);
  });

  socket.on('setStyleProperty', function(data){
    io.sockets.emit('setStyleProperty', data);
  });

  socket.on('setText', function(data){
    io.sockets.emit('setText', data);
  });

  socket.on('addNote', function(data){
    io.sockets.emit('addNote', data);
  });

  socket.on('removeNote', function(data){
    io.sockets.emit('removeNote', data);
  });
  
});