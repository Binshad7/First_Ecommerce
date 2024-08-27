function addToCart(proId){
    $.ajax({
      url:'/add-to-cart/'+proId,
      method:'get',
      success:(response)=>{
        if(response.status){
            let count=$('#cart-count').html()
            count=parseInt(count)+1
            $('#cart-count').html(count)
        }  
      }
    })
  }
  // cart - + button action
  function changeQuantity(cartId,proId,userId,count){ 
    let quantity=parseInt(document.getElementById(proId).innerHTML)
    count=parseInt(count)
    $.ajax({
     url:'/change-product-quantity',
     data:{
       user:userId,
       cart:cartId,
       product:proId,
       count:count,
       quantity:quantity
     },
     method:'post',
     success:(response)=>{

      if(response.removeProduct){
        if (confirm("Product Removed Cart")) {
       // do stuff
    } else {
      return false;
    }
        location.reload()
      }else{
        document.getElementById(proId).innerHTML=quantity+count
        document.getElementById('total').innerHTML=response.total
      }
     }
    })
 } 
 // cart product delete
 function productRemoveCart(cartId,proId){
 // let cartId=parseInt(cartId)
  $.ajax({
    url:'/remove-cart-products',
    data:{
      cart:cartId,
      product:proId
    }, 
    method:'post',
    success:(response)=>{
      if(response.removeProduct){
        if (confirm("Product Removed Cart")) {
       // do stuff
    } else {
      
      return false;
     
    }
        location.reload()
      }
    }
  })
 }

 
 
 $("#checkout-form").submit((e) => {
  e.preventDefault();

  $.ajax({
    url: '/place-order',
    method: 'post',
    data: $('#checkout-form').serialize(),
    success: (response) => {
      alert(response);
    }
  });
});
