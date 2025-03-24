const cloudinary = require('cloudinary')

require('dotenv').config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:  process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

exports.FileUpload = async(file)=>{
  const fileArray = Object.values(file);

  console.log('>>>fileArray>>',fileArray);
  const results = [];

  for(file of fileArray){

    try {
      const result_data = await new Promise((resolve,rejetct)=>{

        cloudinary.uploader.upload_stream((result,error)=>{
          if(error){
            rejetct(error)
          }
            resolve(result)
        }).end(file.data)
      })

      results.push(result_data)

    } catch (error) {
      console.log('get error in file upload fnx',error)
      return error
    }
  }
  return results
}