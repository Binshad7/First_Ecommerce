var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { promise, reject } = require("bcrypt/promises");
const { response } = require("express");
var ObjectId = require("mongodb").ObjectId;

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (userData.Password) {
          userData.Password = await bcrypt.hash(userData.Password, 10);
          db.get()
            .collection(collection.USERS_COLLECTIONS)
            .insertOne(userData)
            .then((data) => {
              console.log("data is this", data);
              console.log("data insert id ", data);
              console.log("userData", userData);
              resolve(userData);
            });
        } else {
          reject(new Error("Password is missing"));
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  doLogin: async (loginData) => {
    // Add a console log to check the received userData
    //console.log("userData ", loginData);
    return new Promise(async (resolve, reject) => {
      let response = {};
      let loginStatus = false;

      let user = await db
        .get()
        .collection(collection.USERS_COLLECTIONS)
        .findOne({ Email: loginData.email });
      // Add a console log to  check user retrieved from the database
      // console.log(' retrieved  user  ',user)
      if (user) {
        bcrypt.compare(loginData.password, user.Password).then((Status) => {
          console.log("login status ", Status);
          if (Status) {
            console.log("login success");
            response.user = user;
            response.Status = true;
            resolve(response);
          } else {
            console.log("login failed");
            resolve({ status: false });
            reject(new Error("Invalid Password"));
          }
        });
      } else {
        console.log("email not valid");
        resolve({ status: false });
        reject(new Error("email not founded"));
      }
    });
  },
  addToCart: (proId, userId) => {
    let proObj={
      item:new ObjectId(proId),
      quantity:1
    }
    return new Promise(async (resolve, reject) => {
      let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) });
      console.log("cart ", userCart);
      if (userCart) {
        let proExist=userCart.products.findIndex(product=> product.item==proId)
       console.log(proExist)
       if(proExist!=-1){
        db.get().collection(collection.CART_COLLECTION).updateOne({user:new ObjectId(userId),'products.item':new ObjectId(proId)},
        {
          $inc:{'products.$.quantity':1}
        }
        ).then(()=>{
          resolve()
        })
       }else{
      db.get().collection(collection.CART_COLLECTION).updateOne(
            { user: new ObjectId(userId) },
            {
              $push: { products: proObj}
            }
          )
          .then((response) => {
            resolve();
          }); 
        }
      } else {
        let cartObj = {
          user: new ObjectId(userId),
          products: [proObj]
        };
        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
            resolve();
          });
      }
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
          {
            $match: { user: new ObjectId(userId) },
          },
          {
            $unwind:'$products'
          },
          {
            $project:{
              item:'$products.item',
              quantity:'$products.quantity'
            }
          },
          {
            $lookup:{
              from:collection.PRODUCT_COLLECTIONS,
              localField:'item',//local field cart item 
              foreignField:'_id',// products collection witch field
              as:'product'
            }
          },
          {
            $project:{
              item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
            }
          }
        ]).toArray()
          console.log(cartItems)
          resolve(cartItems)
      });
    },

  getCartCount:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:new ObjectId(userId)})
      if(cart){
       count=cart.products.length
       resolve(count)
      }
      
    })
  },

  changeProductQuantity:(Obj)=>{
    Obj.count=parseInt(Obj.count)
    Obj.quantity=parseInt(Obj.quantity)

    return new Promise ((resolve,reject)=>{
      if(Obj.count==-1 && Obj.quantity==1){
        db.get().collection(collection.CART_COLLECTION)
        .updateOne({_id:new ObjectId(Obj.cart)},
        {
          $pull:{products:{item:new ObjectId(Obj.product)}}
        }
        ).then((response)=>{
          resolve({removeProduct:true})
        })
      }else{
        db.get().collection(collection.CART_COLLECTION)
        .updateOne({_id:new ObjectId(Obj.cart), 'products.item':new ObjectId(Obj.product)},
        {
          $inc:{'products.$.quantity':Obj.count}
        }
        ).then((response)=>{
         resolve({Status:true}) 
        })
      }
    })
  },

  removeCartProduct:(Obj)=>{
   // Obj.cart=parseInt(Obj.cart)
   // Obj.product=parseInt(Obj.product)
    console.log(Obj.cart,'cart',Obj.product)
    return new Promise ((resolve,reject)=>{
        db.get().collection(collection.CART_COLLECTION)
        .updateOne({_id:new ObjectId(Obj.cart)},
        {
          $pull:{products:{item:new ObjectId(Obj.product)}}
        }
        ).then((response)=>{
          resolve({removeProduct:true})
        })   
  })
  },
  getTotalAmount:(userId)=>{
    console.log(userId)
    return new Promise(async (resolve, reject) => {
      let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
          {
            $match: { user: new ObjectId(userId) },
          },
          {
            $unwind:'$products'
          },
          {
            $project:{
              item:'$products.item',
              quantity:'$products.quantity'
            }
          },
          {
            $lookup:{
              from:collection.PRODUCT_COLLECTIONS,
              localField:'item',//local field cart item 
              foreignField:'_id',// products collection witch field
              as:'product'
            }
          },
          {
            $project:{
              item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
            },
          } ,
          {
            // Convert "quantity" to numeric type  and   // Convert "product.Price" to numeric type
            $group: {
              _id: null,
              'total': {
                $sum: {$multiply: [{ $toDouble: "$quantity" },{ $toDouble: "$product.Price"}]}}
            }
          } 
        ]).toArray()
          console.log(total[0].total)
          resolve(total[0].total)
  
})
  }
}


