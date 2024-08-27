const { log } = require('handlebars')
var db = require('../config/connection')
var collection = require('../config/collections');
const { promise, reject } = require('bcrypt/promises');
const { response } = require('express');

var ObjectId  = require('mongodb').ObjectId
new ObjectId();
module.exports={
    addProduct:(product,callback)=>{

        db.get().collection('product').insertOne(product).then((data)=>{
        
             callback(data.insertedId)
        }) 
    },
    getAllProducts:()=>{ 
        return new Promise( async (resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTIONS).find().toArray()
            resolve(products)
        })
    }, 
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTIONS).deleteOne({_id:new ObjectId(proId)}).then((response)=>{
                //db.get().collection(collection.PRODUCT_COLLECTIONS).deleteOne({_id:new ObjectId(proId)}).then((response)=>{
                  //console.log(response)
                resolve(response)
            })
        })
    },getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:new ObjectId(proId)}).then((product)=>{
                resolve(product)
            })
        }) 
    },updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:new ObjectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    Price:proDetails.Price,
                    category:proDetails.category,
                    Description:proDetails.Description
                }
            }).then((response)=>{
                resolve()
            })
        }) 
    }
} 