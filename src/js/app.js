App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,


  init: function(){
    console.log("App initialized")
    return App.initweb3();
  },

  initweb3: function(){
    if (typeof web3 !== 'undefined'){
      //if a web3 instance is already provided by metamask
      
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      //specift default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },
 
  initContracts: function(){
    $.getJSON("TinyTokenSale.json", function(tinyTokenSale){
    App.contracts.TinyTokenSale = TruffleContract(tinyTokenSale);
    App.contracts.TinyTokenSale.setProvider(App.web3Provider);
    App.contracts.TinyTokenSale.deployed().then(function(tinyTokenSale) {
      console.log("Tiny Token Sale Address:", tinyTokenSale.address);
    });
  }).done(function(){
      
      $.getJSON("TinyToken.json", function(tinyToken){
      App.contracts.TinyToken = TruffleContract(tinyToken);
    App.contracts.TinyToken.setProvider(App.web3Provider);
    App.contracts.TinyToken.deployed().then(function(tinyToken) {
      console.log("Tiny Token Address:", tinyToken.address);  
      });
    App.listenForEvents();
    return App.render();
    });
  })
  },

  //list of events emited from the contract
  listenForEvents: function(){
    App.contracts.TinyTokenSale.deployed().then(function(instance){
      instance.Sell({}, {
        fromBlock:0,
        toBlock: 'latest',
      }).watch(function(error, event){
        console.log("event triggered", event);
        App.render();
      })
    })
  },


    render: function (){
      if (App.loading) {
        return;
      }
      App.loading = true;
      var loader =  $('#loader');
      var content = $('#content');

      loader.show();
      content.hide();
      //get access to the account we are connected
      //load account data
      web3.eth.getCoinbase(function(err, account) {
        if(err === null) {
         // console.log("account",account);
          App.account = account;
          $('#accountAddress').html("Your Account:" + account);
        }
      })
      //load token sale contracts
      App.contracts.TinyTokenSale.deployed().then(function(instance) {
        tinyTokenSaleInstance = instance;
        return tinyTokenSaleInstance.tokenPrice();
      }).then(function(tokenPrice){
        console.log('tokenPrice', tokenPrice);
        App.tokenPrice = tokenPrice;
        $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
        return tinyTokenSaleInstance.tokensSold();
      }).then(function(tokensSold) {
        App.tokensSold = tokensSold.toNumber();
        $('.tokens-sold').html(App.tokensSold);
        $('.tokens-available').html(App.tokensAvailable);

        var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
        console.log(progressPercent);
          $('#progress').css('width', progressPercent + '%');

          //load token contract
          App.contracts.TinyToken.deployed().then(function(instance) {
            tinyTokenSaleInstance = instance;
            return tinyTokenSaleInstance.balanceOf(App.account);
          }).then(function(balance) {
            $('.tiny-balance').html(balance.toNumber());
             App.loading = false;
             loader.hide();
             content.show();
         })
    });    
  },

  buyTokens:  function(){
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    App.contracts.TinyTokenSale.deployed().then(function(instance){
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000
      });
    }).then(function(result){
      console.log("Tokens bought...")
      $('form').trigger('reset') //reset number of tokens in form
       $('#loader').hide();
      $('#content').show();//reset number of tokens in form
       //wait for sale event
  });
 }
} 

$(function(){
  $(window).load(function(){
    App.init();
  })
});
