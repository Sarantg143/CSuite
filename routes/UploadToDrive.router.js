const Router = require('express')

UploadDriveRouter = Router()
const {google} = require('googleapis');
const fs = require('fs')
const OAuth2 = google.auth.OAuth2;
require('dotenv').config()

var multer = require('multer');


const OAuth2Client = new OAuth2(process.env.CLIENT_ID,process.env.SECRET_ID,process.env.REDIRECT_URL)



let uniqueFileName;

const storage = multer.diskStorage({
    destination : function(req,res,cb){
        cb(null,'./temp')
    },
    filename:function (req,res,cb){

        const suffix = Date.now() ;
        uniqueFileName =  suffix +""+ res.originalname
        cb( null , uniqueFileName)

    },
});



const upload = multer({ storage: storage });




UploadDriveRouter.post('/',upload.fields([{ name: 'document' }]),async(req,res)=>{
   
   
    try {
    
    let mime = req.files.document[0].mimetype
    let originalName = req.files.document[0].originalname
   
    OAuth2Client.setCredentials({refresh_token : process.env.REFRESH_TOKEN })
    const drive = google.drive({version :'v3' , auth : OAuth2Client})

    var fileid ;
    var promise1 = new Promise(function(resolve,reject){
     fileupload =  drive.files.create({
        requestBody : {
            name : originalName ,
             mimeType: mime    
        },
        media: {
          mimeType: mime,
          body: fs.createReadStream(`./temp/${uniqueFileName}`)
        }
    },(err,data)=>{
        if(err){
            console.log("-------",err)
            res.status(500).json({success : false ,error : err.message})
        }
        else{
             fileid = data.data.id
            drive.permissions.create({
                fileId : fileid ,
                requestBody : {
                    
                    role : 'reader',
                    type : 'anyone'
                }
            })
            resolve(data.data.id)

            console.log('video uploaded',data.data)
        }
        


})
        
})

const geturl = (fileId) => {
    return `https://docs.google.com/presentation/d/${fileId}/edit#slide=id.p1`;
};

fileUploadPromise.then((fileId) => {
    const editSlideUrl = geturl(fileId);
    res.status(200).json({ url: editSlideUrl });

    try {
        fs.unlinkSync(`./temp/${uniqueFileName}`);
        console.log('Temporary file deleted');
    } catch (e) {
        console.log("Temporary file not found or already deleted");
    }
});

const geturl1 = async(file_id)=>{
    
    try {
        const result = await drive.files.get({
            fileId : file_id,
            fields : 'webViewLink , webContentLink'
        })
    
        res.status(200).json({url : result.data.webViewLink})
    
        return result.data

    }catch(e){
        res.status(500).json({success : false ,error : err.message})
    }

}

 promise1.then((file_id)=>{
    
    fileid = file_id
    url = geturl(file_id)
    try{
        fs.unlinkSync(`./temp/${uniqueFileName}`);
        console.log('temp deleted')

    }catch(e){
        console.log("no such dir or already ")
    }

})


}catch(e){
    console.log(e)
    try{
        fs.unlinkSync(`./temp/${uniqueFileName}`);
        console.log('temp deleted')

    }catch(e){
        console.log("no such dir or already ")
    }
    res.status(400).json({error : e.message , success : false})

}

})



module.exports = UploadDriveRouter
