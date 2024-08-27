var express = require("express");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");
var usersHelpers = require("../helpers/user-helpers");
var session = require("express-session");

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn)
   next();
  else 
  res.redirect("/login");
};
/* GET home page. */
router.get("/",async function (req, res, next) {
  let user = req.session.user
  // console.log('user anu ',user)
   let cartCount=null
   if(req.session.user){
    cartCount=await usersHelpers.getCartCount(req.session.user._id)
   }
  productHelper.getAllProducts().then((products) => {
    res.render("users/views-products", { products,user,cartCount});
  });
});
router.get("/signup", (req, res) => {
  res.render("login/signup");

});
router.post("/signup", (req, res) => {
  const name = req.body.Name;
  const email = req.body.Email;
  const Password = req.body.Password;
 // console.log(req.body);
  if (name && email && Password) {

    usersHelpers.doSignup(req.body).then((response) => {
      req.session.loggedIn = true
      req.session.user = response
      console.log('res ..',response)
        productHelper.getAllProducts().then((products) => {
         // console.log(products);
        // res.send('finish')
          res.redirect("/");
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send("Signup");
      });
  } else {
    res.status(400).send("invalid request Username, or Password missing");
  }
});
router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    // console.log(req.session.loggedIn)
    res.redirect("/");
  } else {
    res.render("login/login", {
      loginErr: req.session.loginErr,
    });
    req.session.loginErr = false;
  }
});
router.post("/login", (req, res) => {
  usersHelpers.doLogin(req.body).then((response) => {
    if (response.Status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect('/');
    } else {
      req.session.loginErr = " Invalid  email or password ";
      res.redirect("/login");
    }
  });
});
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
router.get("/cart", verifyLogin,async (req, res) => {
  let userCart =await usersHelpers.getCartProducts(req.session.user._id)
  let totalValue =await  usersHelpers.getTotalAmount(req.session.user._id)
  
  res.render("users/cart",{userCart,user:req.session.user,totalValue});
});
router.get('/add-to-cart/:id', (req,res)=>{
  console.log('api call')
  console.log('user id ',req.session.user._id)
  usersHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
   res.json({status:true})
  })
 // console.log('req. id',req.params.id)
 // console.log('session id ',req.session.user._id)
}),
router.post('/change-product-quantity',async(req,res,next)=>{
  //console.log(req.body)
    usersHelpers.changeProductQuantity(req.body).then(async(response)=>{
      
      response.total=await usersHelpers.getTotalAmount(req.body.user)

    res.json(response)
 })
})
router.post('/remove-cart-products',(req,res)=>{
  usersHelpers.removeCartProduct(req.body).then((response)=>{
    res.json(response)
  })
})
router.get('/placeOrder',verifyLogin,async (req,res)=>{
  let total=await usersHelpers.getTotalAmount(req.session.user._id)
 // console.log(total)
    res.render("users/place-order",{ user:req.session.user,total})  
})
router.post('/place-oder',(req,res)=>{
  console.log('hello',req.body)

})


module.exports = router;