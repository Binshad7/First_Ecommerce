var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers');
const fileUpload = require('express-fileupload');

/* GET users listing. */
router.get('/', function(req, res, next) {
 productHelper.getAllProducts().then((products)=>{
  console.log(products)

  res.render('admin/views-products',{admin:true,products})
 })
  
});

router.get('/add-product', (req, res, next) => {
  res.render('admin/add-product', {admin:true});
});
router.post('/add-products',(req,res)=>{

  productHelper.addProduct(req.body,(id)=>{
    console.log(id)
    let image=req.files.image
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render('admin/add-product',{admin:true})
      }else{
        console.log(err)
      }
    })  
  })
})
router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  //console.log('proId',proId)
  //res.render('admin/delete-product')
  productHelper.deleteProduct(proId).then((response)=>{
   res.redirect('/admin/')
  })
})
router.get('/edit-product/:id',async (req,res)=>{
  let product=await productHelper.getProductDetails(req.params.id)
  console.log(product)
  res.render('admin/edit-product',{product})
})
router.post('/edit-products/:id',(req,res)=>{
  //console.log(req.params.id)
  productHelper.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    let id = req.params.id
    //console.log('yoyo',req.files.image)
    if(req.files && req.files.image){
      let image=req.files.image
    image.mv('./public/product-images/'+id+'.jpg') 
    } 
    
  })
})


module.exports = router;
