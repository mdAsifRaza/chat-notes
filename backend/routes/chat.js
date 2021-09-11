var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');
const authToken = require('../middlewares/auth-token');

var chatModel = require('../models/chat');
var noteModel = require('../models/note');

////////////////////////////////////////////////
//           Route for create chat            //
////////////////////////////////////////////////
router.post('/create',
    body('title','title must be minimum 2 character').trim().isLength({ min: 2 }),
    body('description','description must be minimum 4 character').trim().isLength({ min: 4 }),authToken,
     async (req, res) => {

    const errors = validationResult(req);
    
    // throw validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
   
    // creating user object
    var newChat = new chatModel({
        userid : req.userid,
        title:req.body.title,
        description:req.body.description
    });

    //pushing user object to mongo
    newChat.save(function(err,data){
        if(err) 
            return res.status(500).json({error:'500',
                mssg:"internal server error"});
        else{
           return res.status(200).json({success:'200',
                        mssg:"congratulations chat created",
                    info : {title :data.title , description: data.description}});
        }
    });
});

////////////////////////////////////////////////
//             Route for read chat            //
////////////////////////////////////////////////
router.post('/read',
    authToken,
     async (req, res) => {

     // find all the chat with their userid
     try{
     var chatData = await chatModel.find({ userid : req.userid });
    //  console.log(chatData)
     if( !chatData || chatData.length == 0){
        return res.status(404).json({error:'404',
        mssg:"chats not found"});
     }
     }
     catch{
        return res.status(404).json({error:'404',
        mssg:"chats not found"});
     }
     return res.status(200).json({success:'200',
     mssg:"all chats retrieved",
    data : chatData});
});

////////////////////////////////////////////////
//           Route for delete chat            //
////////////////////////////////////////////////
router.post('/delete/:chatid',
    authToken,
     async (req, res) => {

     // delete chat with logged in userid and chatid 
        try{
            let noteExist = await noteModel.deleteMany({ chatid : req.params.chatid , userid : req.userid });
        let chatExist = await chatModel.findOneAndDelete({_id : req.params.chatid , userid : req.userid });
        // console.log(chatExist)
        if(!chatExist){
            return res.status(404).json({error:'404',
            mssg:"chat not found"});
        }
     }
     catch{
        return res.status(404).json({error:'404',
        mssg:"chat not found"});
     }
     return res.status(200).json({success:'200',
     mssg:"chat deleted with their notes"});
});

module.exports = router;